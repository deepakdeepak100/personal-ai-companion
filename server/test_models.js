const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // The SDK doesn't expose listModels directly on the main class in all versions, 
        // but usually we can try to just use a known stable model or check via a distinct method if available.
        // Actually, checking documentation or just trying 'gemini-1.5-flash-latest' might be faster, 
        // but let's try to query the ID if possible?
        // Wait, the error explicitly says "Call ListModels".

        // In the node SDK, it is often:
        // const response = await genAI.getModel("models/gemini-1.5-flash"); // Not exactly.

        // Let's stick to trying to just use the generic request to see available models if possible 
        // OR just try 'gemini-pro' again? No that failed.

        // Actually typically current valid models are: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'.
        // If 1.5-flash failed, maybe the user has an older key? No, keys are general.

        // Let's try to write a script that tries multiple names and reports which one works.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        console.log("Testing models...");

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} is working.`);
                return; // Found one!
            } catch (error) {
                console.log(`FAILED: ${modelName} - ${error.message.split(':')[0]}`);
            }
        }
        console.log("All common model names failed.");

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
