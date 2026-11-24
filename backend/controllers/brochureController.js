const fs = require("fs/promises");
const mongoose = require("mongoose");

const Brochure = require("../models/Brochure");
const BrochureChunk = require("../models/BrochureChunk");

const extractPdfText = require("../utils/pdfExtractor");
const chunkPages = require("../utils/textChunker");
const generateEmbeddings = require("../utils/geminiEmbedding");

// =========================================
// UPLOAD AND PROCESS BROCHURE
// =========================================

const uploadBrochure = async (req, res) => {
  let brochure;

  try {
    // 1. Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    // 2. Save brochure metadata in MongoDB
    // No manual vehicle model or variant selection required.
    brochure = await Brochure.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      processingStatus: "processing",
    });

    try {
      // 3. Extract text from every PDF page
      const extractedPages = await extractPdfText(req.file.path);

      // 4. Check whether the PDF contains extractable text
      const hasExtractableText = extractedPages.some(
        (page) => page.text.trim().length > 0,
      );

      if (!hasExtractableText) {
        throw new Error(
          "No extractable text found in this PDF. OCR may be required.",
        );
      }

      // 5. Save extracted text and page numbers
      brochure.extractedPages = extractedPages;
      await brochure.save();

      // 6. Divide extracted text into smaller chunks
      const chunks = chunkPages(extractedPages);

      if (chunks.length === 0) {
        throw new Error("No text chunks could be generated.");
      }

      console.log(
        `Generated ${chunks.length} chunks for ${brochure.originalName}`,
      );

      // 7. Generate embeddings and save chunks in batches
      const batchSize = 20;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const texts = batch.map((chunk) => chunk.text);

        // Generate Gemini embeddings
        const embeddings = await generateEmbeddings(
          texts,
          "RETRIEVAL_DOCUMENT",
        );

        // Validate embedding response
        if (
          !embeddings ||
          embeddings.length !== batch.length ||
          embeddings.some(
            (embedding) =>
              !Array.isArray(embedding) || embedding.length !== 3072,
          )
        ) {
          throw new Error(
            "Gemini returned invalid embeddings for the brochure.",
          );
        }

        // Prepare chunk documents
        const chunkDocuments = batch.map((chunk, index) => ({
          brochure: brochure._id,
          uploadedBy: req.user._id,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          embedding: embeddings[index],
        }));

        // Save chunks and embeddings
        await BrochureChunk.insertMany(chunkDocuments);

        console.log(
          `Processed ${Math.min(i + batchSize, chunks.length)} / ${chunks.length} chunks`,
        );
      }

      // 8. Mark brochure as indexed
      brochure.processingStatus = "indexed";
      await brochure.save();

      console.log(`Brochure "${brochure.originalName}" indexed successfully.`);

      // 9. Return successful response
      return res.status(201).json({
        success: true,
        message:
          "Brochure uploaded, text extracted, and embeddings generated successfully.",
        brochure: {
          _id: brochure._id,
          originalName: brochure.originalName,
          fileSize: brochure.fileSize,
          processingStatus: brochure.processingStatus,
          totalPages: extractedPages.length,
          totalChunks: chunks.length,
        },
      });
    } catch (processingError) {
      console.error("Brochure processing error:", processingError);

      // Remove partially generated chunks and embeddings
      await BrochureChunk.deleteMany({
        brochure: brochure._id,
      });

      // Mark brochure processing as failed
      brochure.processingStatus = "failed";
      await brochure.save();

      return res.status(422).json({
        success: false,
        message: "Brochure uploaded, but processing failed.",
        error: processingError.message,
        brochure: {
          _id: brochure._id,
          originalName: brochure.originalName,
          processingStatus: brochure.processingStatus,
        },
      });
    }
  } catch (error) {
    console.error("Brochure upload error:", error);

    // Remove uploaded file if brochure metadata was not saved
    if (!brochure && req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload brochure.",
    });
  }
};

// =========================================
// GET ALL USER BROCHURES
// =========================================

const getBrochures = async (req, res) => {
  try {
    const brochures = await Brochure.find({
      uploadedBy: req.user._id,
    })
      .select("-filePath -extractedPages")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: brochures.length,
      brochures,
    });
  } catch (error) {
    console.error("Get brochures error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brochures.",
    });
  }
};

// =========================================
// DELETE BROCHURE AND RELATED DATA
// =========================================

const deleteBrochure = async (req, res) => {
  let session;

  try {
    const { brochureId } = req.params;

    // 1. Validate brochure ID
    if (!mongoose.Types.ObjectId.isValid(brochureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brochure ID.",
      });
    }

    // 2. Find brochure belonging to the logged-in user
    const brochure = await Brochure.findOne({
      _id: brochureId,
      uploadedBy: req.user._id,
    });

    if (!brochure) {
      return res.status(404).json({
        success: false,
        message: "Brochure not found.",
      });
    }

    const filePath = brochure.filePath;

    // 3. Delete brochure and chunks together
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await BrochureChunk.deleteMany({ brochure: brochure._id }, { session });

      await Brochure.deleteOne(
        {
          _id: brochure._id,
          uploadedBy: req.user._id,
        },
        { session },
      );
    });

    // 4. Delete physical PDF after database deletion succeeds
    let fileDeleted = true;

    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      if (fileError.code !== "ENOENT") {
        fileDeleted = false;

        console.error("Physical PDF deletion failed:", fileError);
      }
    }

    return res.status(200).json({
      success: true,
      message: fileDeleted
        ? "Brochure and all related data deleted successfully."
        : "Brochure and database data deleted, but the physical PDF could not be removed.",
      fileDeleted,
    });
  } catch (error) {
    console.error("Delete brochure error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete brochure.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  uploadBrochure,
  getBrochures,
  deleteBrochure,
};
