const mongoose = require("mongoose");

const Brochure = require("../models/Brochure");
const BrochureChunk = require("../models/BrochureChunk");
const generateEmbeddings = require("../utils/geminiEmbedding");

const searchRelevantChunks = async ({
  question,
  userId,
  brochureId = null,
  vehicleModels = [],
  limit = 5,
  perBrochureLimit = 3,
}) => {
  try {
    // 1. Validate input
    if (!question || !question.trim()) {
      throw new Error("Question is required.");
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("A valid user ID is required.");
    }

    if (brochureId && !mongoose.Types.ObjectId.isValid(brochureId)) {
      throw new Error("Invalid brochure ID.");
    }

    if (!Array.isArray(vehicleModels)) {
      throw new Error("Vehicle models must be an array.");
    }

    // 2. Generate the question embedding only once
    const queryEmbeddings = await generateEmbeddings(
      [question],
      "RETRIEVAL_QUERY",
    );

    const queryVector = queryEmbeddings[0];

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 3. If a specific brochure is selected, search only that brochure
    if (brochureId) {
      const brochure = await Brochure.findOne({
        _id: brochureId,
        uploadedBy: userObjectId,
      }).select("_id");

      if (!brochure) {
        throw new Error("Brochure not found.");
      }

      const chunks = await searchChunks({
        queryVector,
        userId: userObjectId,
        brochureId: brochure._id,
        limit,
      });

      return chunks;
    }

    // 4. If vehicle models are identified, find their brochures
    if (vehicleModels.length > 0) {
      const normalizedModels = [
        ...new Set(
          vehicleModels
            .filter((model) => typeof model === "string")
            .map((model) => model.trim())
            .filter(Boolean),
        ),
      ];

      if (normalizedModels.length === 0) {
        throw new Error("Valid vehicle models are required.");
      }

      const brochures = await Brochure.find({
        uploadedBy: userObjectId,
        vehicleModel: {
          $in: normalizedModels,
        },
        processingStatus: "indexed",
      }).select("_id vehicleModel originalName");

      if (brochures.length === 0) {
        return [];
      }

      // 5. Search each vehicle brochure independently
      const searchResults = await Promise.all(
        brochures.map(async (brochure) => {
          const chunks = await searchChunks({
            queryVector,
            userId: userObjectId,
            brochureId: brochure._id,
            limit: perBrochureLimit,
          });

          return chunks;
        }),
      );

      // 6. Combine and rank results from all brochures
      const relevantChunks = searchResults
        .flat()
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return relevantChunks;
    }

    // 7. No specific vehicle identified: search across all user brochures
    return await searchChunks({
      queryVector,
      userId: userObjectId,
      limit,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    throw error;
  }
};

// Reusable vector search function
const searchChunks = async ({
  queryVector,
  userId,
  brochureId = null,
  limit,
}) => {
  const searchFilter = {
    uploadedBy: userId,
  };

  if (brochureId) {
    searchFilter.brochure = brochureId;
  }

  const relevantChunks = await BrochureChunk.aggregate([
    {
      $vectorSearch: {
        index: "brochure_vector_index",
        path: "embedding",
        queryVector,
        numCandidates: Math.max(limit * 10, 50),
        limit,
        filter: searchFilter,
      },
    },
    {
      $lookup: {
        from: Brochure.collection.name,
        localField: "brochure",
        foreignField: "_id",
        as: "brochureDetails",
      },
    },
    {
      $unwind: "$brochureDetails",
    },
    {
      $project: {
        _id: 1,
        brochure: 1,
        brochureName: "$brochureDetails.originalName",
        vehicleModel: "$brochureDetails.vehicleModel",
        pageNumber: 1,
        chunkIndex: 1,
        text: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);

  return relevantChunks;
};

module.exports = searchRelevantChunks;
