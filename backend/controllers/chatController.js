const mongoose = require("mongoose");

const Brochure = require("../models/Brochure");
const searchRelevantChunks = require("../services/retrievalService");
const generateAnswer = require("../services/answerService");

// Escape special characters before creating a regular expression
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Identify models dynamically from the user's uploaded brochures
const detectVehicleModels = (question, brochures) => {
  const normalizedQuestion = question.toLowerCase();

  // Remove duplicate model names and prefer longer names
  const uniqueModels = [
    ...new Set(
      brochures
        .map((brochure) => brochure.vehicleModel?.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => b.length - a.length);

  const matchedModels = [];
  const occupiedRanges = [];

  for (const model of uniqueModels) {
    // Allow "Hyundai Creta" in the database to match "Creta"
    const searchableName = model.replace(/^hyundai\s+/i, "").trim();

    const escapedName = escapeRegex(searchableName).replace(/\s+/g, "\\s+");

    const pattern = new RegExp(
      `(^|[^a-z0-9])(${escapedName})(?=$|[^a-z0-9])`,
      "gi",
    );

    const matches = [...normalizedQuestion.matchAll(pattern)];

    for (const match of matches) {
      const start = match.index + match[1].length;
      const end = start + match[2].length;

      // Avoid matching a shorter model inside a longer model name
      const overlaps = occupiedRanges.some(
        (range) => start < range.end && end > range.start,
      );

      if (!overlaps) {
        matchedModels.push(model);
        occupiedRanges.push({ start, end });
        break;
      }
    }
  }

  return matchedModels;
};

const askQuestion = async (req, res) => {
  try {
    const { question, brochureId } = req.body;

    // 1. Validate question
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question.",
      });
    }

    // 2. Validate optional brochure ID
    if (brochureId && !mongoose.Types.ObjectId.isValid(brochureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brochure ID.",
      });
    }

    const trimmedQuestion = question.trim();

    // 3. Fetch this user's successfully indexed brochures
    const brochures = await Brochure.find({
      uploadedBy: req.user._id,
      vehicleModel: { $nin: [null, ""] },
      processingStatus: { $in: ["indexed", "processed"] },
    }).select("vehicleModel");

    // 4. Identify models mentioned in the question
    const vehicleModels = detectVehicleModels(trimmedQuestion, brochures);

    console.log("Detected vehicle models:", vehicleModels);

    // 5. Retrieve relevant chunks
    const relevantChunks = await searchRelevantChunks({
      question: trimmedQuestion,
      userId: req.user._id,
      brochureId: brochureId || null,
      vehicleModels: brochureId ? [] : vehicleModels,
      limit: 6,
      perBrochureLimit: 3,
    });

    // 6. Handle missing information
    if (relevantChunks.length === 0) {
      return res.status(200).json({
        success: true,
        answer:
          "I couldn't find relevant information in your uploaded brochures to answer this question.",
        sources: [],
      });
    }

    // 7. Generate answer
    const result = await generateAnswer(trimmedQuestion, relevantChunks);

    // 8. Return answer and sources
    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources.map((source) => ({
        pageNumber: source.pageNumber,
        chunkIndex: source.chunkIndex,
        score: source.score,
        brochureId: source.brochureId,
      })),
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate an answer. Please try again.",
    });
  }
};

module.exports = { askQuestion };
