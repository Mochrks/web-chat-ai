const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API Key found in .env.local");
    return;
  }

  const client = new GoogleGenAI({ apiKey: apiKey });

  try {
    console.log("Listing available models...");
    const response = await client.models.list();

    // The structure might vary, let's log the raw output or iterate
    if (response) {
      // usually response is an object with 'models' array or it's an array
      const models = response.models || response;
      console.log("Found models:");
      // @ts-ignore
      models.forEach((m) => {
        // @ts-ignore
        if (m.name.includes("generateContent")) {
          // Filter for generation models
          // @ts-ignore
          console.log(`- ${m.name}`); // e.g. models/gemini-1.5-flash
        } else if (
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes("generateContent")
        ) {
          // @ts-ignore
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log("No models found or empty response.");
      console.log(response);
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
    if (error.statusDetails) {
      console.error("Details:", JSON.stringify(error.statusDetails, null, 2));
    }
  }
}

main();
