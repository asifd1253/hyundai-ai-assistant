require("dotenv").config();

const connectDB = require("../config/db");
const mongoose = require("mongoose");

const searchRelevantChunks = require("../services/retrievalService");

const testVectorSearch = async () => {
  try {
    // Read values from terminal arguments
    const question = process.argv[2];
    const userId = process.argv[3];
    const brochureId = process.argv[4] || null;

    if (!question || !userId) {
      throw new Error(
        'Usage: node scripts/testVectorSearch.js "Your question" USER_ID [BROCHURE_ID]',
      );
    }

    // Connect to MongoDB
    await connectDB();

    console.log("Connected to MongoDB.");
    console.log("Question:", question);

    // Search for relevant chunks
    const results = await searchRelevantChunks({
      question,
      userId,
      brochureId,
      limit: 5,
    });

    console.log("\nRelevant chunks found:", results.length);

    results.forEach((chunk, index) => {
      console.log(`\n========== RESULT ${index + 1} ==========`);
      console.log("Page:", chunk.pageNumber);
      console.log("Chunk:", chunk.chunkIndex);
      console.log("Similarity score:", chunk.score);
      console.log("Text:", chunk.text);
    });

    if (results.length === 0) {
      console.log("No relevant brochure chunks found.");
    }
  } catch (error) {
    console.error("Vector search test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

testVectorSearch();
