const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API KEY found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    console.log("Fetching available models...");
    const result = await genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to get client
    // Actually listModels is on the client instance directly in some versions or via simple fetch,
    // but the SDK structure is genAI.getGenerativeModel.
    // Let's trying to find the listModels method on the class or response.
    // Actually it's usually NOT on the instance.
    // Let's try to just hit the API endpoint if SDK fails, but SDK has .listModels?
    // Wait, the documentation says:
    // const response = await genAI.listModels();
    // NOT genAI.getGenerativeModel...

    // Let's try to infer from error or just try standard ones.
    // The error message from user: "Call ListModels to see the list..."
    // This implies the SDK method exists? Or it's a generic API message.

    // Let's try standard known models in a loop to see which one doesn't throw 404 immediately on instantiation?
    // No, instantiation doesn't throw. sendMessage throws.

    // Let's try to run a simple generateContent on a few specific model names.

    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro",
    ];

    for (const modelName of candidates) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`SUCCESS: ${modelName} is working.`);
        console.log(await result.response.text());
        break; // Found one
      } catch (e) {
        console.log(`FAILED: ${modelName} - ${e.message.split("\n")[0]}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
