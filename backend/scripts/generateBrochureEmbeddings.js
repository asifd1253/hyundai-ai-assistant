require("dotenv").config();

const connectDB = require("../config/db");
const BrochureChunk = require("../models/BrochureChunk");
const generateEmbeddings = require("../utils/geminiEmbedding");

const generateBrochureEmbeddings = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB.");

    // Find chunks that don't have embeddings yet
    const chunks = await BrochureChunk.find({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    }).select("+embedding");

    if (chunks.length === 0) {
      console.log("All chunks already have embeddings.");
      return;
    }

    console.log(`Found ${chunks.length} chunks.`);

    const batchSize = 20;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const texts = batch.map((chunk) => chunk.text);

      // Generate embeddings for this batch
      const embeddings = await generateEmbeddings(texts, "RETRIEVAL_DOCUMENT");

      // Save each vector against its original chunk
      const operations = batch.map((chunk, index) => ({
        updateOne: {
          filter: { _id: chunk._id },
          update: {
            $set: {
              embedding: embeddings[index],
            },
          },
        },
      }));

      await BrochureChunk.bulkWrite(operations);

      console.log(
        `Processed ${Math.min(i + batchSize, chunks.length)} / ${chunks.length} chunks`,
      );
    }

    console.log("All embeddings generated successfully.");
  } catch (error) {
    console.error("Embedding generation failed:", error);
  } finally {
    process.exit();
  }
};

generateBrochureEmbeddings();
