const generateEmbeddings = async (texts, taskType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from backend .env");
  }

  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("At least one text is required.");
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: texts,
      config: {
        taskType,
      },
    });

    const embeddings = response.embeddings?.map((item) => item.values);

    if (!embeddings || embeddings.length !== texts.length) {
      throw new Error("Gemini returned an unexpected number of embeddings.");
    }

    return embeddings;
  } catch (error) {
    console.error("Gemini embedding error:", error);
    throw error;
  }
};

module.exports = generateEmbeddings;
