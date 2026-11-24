require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const searchRelevantChunks = require("../services/retrievalService");
const generateAnswer = require("../services/answerService");

const testRag = async () => {
  try {
    const question = process.argv[2];
    const userId = process.argv[3];
    const brochureId = process.argv[4] || null;

    if (!question || !userId) {
      throw new Error(
        'Usage: node scripts/testRag.js "Question" USER_ID [BROCHURE_ID]',
      );
    }

    await connectDB();

    console.log("\nMongoDB connected successfully.");
    console.log("\nUser question:", question);

    // Step 1: Retrieve relevant brochure chunks
    const relevantChunks = await searchRelevantChunks({
      question,
      userId,
      brochureId,
      limit: 5,
    });

    console.log("\nRetrieved chunks:", relevantChunks.length);

    if (relevantChunks.length === 0) {
      console.log("\nNo relevant brochure information found.");
      return;
    }

    // Step 2: Generate an answer using Gemini
    const result = await generateAnswer(question, relevantChunks);

    console.log("\n========== GEMINI ANSWER ==========\n");
    console.log(result.answer);

    console.log("\n========== SOURCES ==========\n");

    result.sources.forEach((source, index) => {
      console.log(
        `${index + 1}. Page ${source.pageNumber} | Score: ${source.score}`,
      );
    });

    console.log("\nRAG test completed successfully.");
  } catch (error) {
    console.error("\nRAG test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

testRag();
