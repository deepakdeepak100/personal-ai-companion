const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key', // Prevent crash if key is missing
});

const generateResponse = async (mode, message, apiKeyIndex = 1) => {
    // Determine which API key to use
    const envKey = apiKeyIndex === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${apiKeyIndex}`;
    const selectedKey = process.env[envKey] || process.env.GEMINI_API_KEY || 'dummy_key';

    // fast fail if NO keys and return mock response
    if ((!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) &&
        (!selectedKey || selectedKey.includes('your_') || selectedKey === 'dummy_key')) {
        console.log("No valid API keys found. Using Mock Mode.");
        return getMockResponse(mode, message);
    }

    // Initialize Gemini dynamically
    const genAI = new GoogleGenerativeAI(selectedKey);

    let responseText = '';

    try {
        // Use Gemini for everything if OpenAI key is missing
        const useGemini = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_');
        console.log(`[DEBUG] Mode: ${mode}, UseGemini: ${useGemini}`);
        console.log(`[DEBUG] Gemini Key (${envKey}) starts with: ${selectedKey ? selectedKey.substring(0, 4) : 'None'}`);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        switch (mode) {
            case 'personal':
                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: "You are a friendly personal companion. Keep conversations casual, empathetic, and supportive." }] },
                        { role: "model", parts: [{ text: "Hi there! I'm here for you. How are you feeling today?" }] },
                    ],
                });
                const result = await chat.sendMessage(message);
                responseText = (await result.response).text();
                break;

            case 'professional':
                if (useGemini) {
                    const prompt = `You are a professional productivity assistant. Provide concise, professional, and actionable advice. Query: ${message}`;
                    const result = await model.generateContent(prompt);
                    responseText = (await result.response).text();
                } else {
                    const completion = await openai.chat.completions.create({
                        messages: [
                            { role: "system", content: "You are a professional assistant. Provide concise, accurate, and professional answers." },
                            { role: "user", content: message }
                        ],
                        model: "gpt-3.5-turbo",
                    });
                    responseText = completion.choices[0].message.content;
                }
                break;

            case 'health':
                const healthPrompt = `You are a health assistant. Provide general health advice but ALWAYS disclaim that you are an AI and not a doctor. If the query is a medical emergency, verify they should call emergency services. Query: ${message}`;
                const healthResult = await model.generateContent(healthPrompt);
                responseText = (await healthResult.response).text();
                break;

            case 'workout':
                if (useGemini) {
                    const prompt = `You are a workout assistant. Provide structured workout plans and fitness advice. Use bullet points. Query: ${message}`;
                    const result = await model.generateContent(prompt);
                    responseText = (await result.response).text();
                } else {
                    const completion = await openai.chat.completions.create({
                        messages: [
                            { role: "system", content: "You are a workout assistant." },
                            { role: "user", content: message }
                        ],
                        model: "gpt-3.5-turbo",
                    });
                    responseText = completion.choices[0].message.content;
                }
                break;

            default:
                responseText = "I'm not sure how to help with that mode.";
        }
        return responseText;

    } catch (error) {
        console.error("AI Service Error Full Object:", error);
        console.error("AI Service Error Message:", error.message);
        return getMockResponse(mode, message);
    }
};

const getMockResponse = (mode, message) => {
    return "⚠️ **Rate Limit Exceeded:** The selected AI model has hit its daily or per-minute quota on your Google API key. Please select a different model from the dropdown menu at the top to continue chatting.";
};

module.exports = { generateResponse };
