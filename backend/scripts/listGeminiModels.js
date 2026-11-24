require("dotenv").config();

const listGeminiModels = async () => {
  try {
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    console.log("Available Gemini models:\n");

    const models = await ai.models.list();

    for await (const model of models) {
      if (
        model.supportedActions?.includes("generateContent") ||
        model.supportedGenerationMethods?.includes("generateContent")
      ) {
        console.log("Model:", model.name);
        console.log("Display name:", model.displayName);
        console.log("-----------------------------");
      }
    }
  } catch (error) {
    console.error("Failed to list Gemini models:", error);
  }
};

listGeminiModels();
