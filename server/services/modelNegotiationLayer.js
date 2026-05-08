const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Handle simulated negotiation between models for health/workout modes.
 * @param {string} mode - 'health' or 'workout'
 * @param {string} message - User query
 * @param {number} apiKeyIndex - Index of the API key to use
 * @returns {Promise<{ negotiationData: object, formattedString: string }>}
 */
const handleNegotiation = async (mode, message, apiKeyIndex = 1) => {
    // Determine which API key to use
    const envKey = apiKeyIndex === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${apiKeyIndex}`;
    const selectedKey = process.env[envKey] || process.env.GEMINI_API_KEY || 'dummy_key';

    // fast fail if no keys
    if (!selectedKey || selectedKey.includes('your_') || selectedKey === 'dummy_key') {
        return getMockNegotiationFallback(mode, message);
    }

    // Initialize Gemini dynamically
    const genAI = new GoogleGenerativeAI(selectedKey);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Phase 1: Simulated ChatGPT (Analytical)
        const chatGptPrompt = `You are ChatGPT, an analytical and structured AI. The user is asking a ${mode} related question. Provide a brief, highly analytical perspective on this query: "${message}"`;
        const chatGptOutput = await generateSingle(model, chatGptPrompt);

        // Phase 2: Simulated Gemini (Balanced, replying to ChatGPT)
        const geminiPrompt = `You are Gemini, a balanced and conversational AI. The user asked: "${message}". 
ChatGPT just offered this analysis: "${chatGptOutput}". 
Respond directly to ChatGPT's analysis, build upon it, and offer practical, actionable advice. Sound like you are in a lively panel discussion. Keep it brief.`;
        const geminiOutput = await generateSingle(model, geminiPrompt);

        // Phase 3: Simulated Claude (Safety-focused, replying to both)
        const claudePrompt = `You are Claude, a highly careful and safety-focused AI. The user asked: "${message}". 
ChatGPT said: "${chatGptOutput}"
Gemini said: "${geminiOutput}"
Join the discussion. Formulate a brief response that addresses their points, corrects any unsafe advice if necessary, and provides a highly cautious, safety-first perspective. Maintain a polite, collaborative panel discussion tone.`;
        const claudeOutput = await generateSingle(model, claudePrompt);

        // Phase 4: Final Synthesis
        const synthesisPrompt = `You are an AI synthesis engine. Synthesize the following panel discussion into a single, cohesive, highly practical, and safe final response for the user. Do not mention the other models or the debate in the final response. Present it as the final, definitive answer.

User Query: "${message}"
ChatGPT: "${chatGptOutput}"
Gemini: "${geminiOutput}"
Claude: "${claudeOutput}"

Provide ONLY the final output. ${mode === 'health' ? 'Ensure you include a medical disclaimer.' : ''}`;
        
        const finalOutput = await generateSingle(model, synthesisPrompt);

        // Prepare return object
        const negotiationData = {
            chatgpt: chatGptOutput,
            gemini: geminiOutput,
            claude: claudeOutput,
            final: finalOutput
        };

        // We only want the final output as the main chat content
        return { negotiationData, formattedString: finalOutput };

    } catch (error) {
        console.error("Negotiation Layer Error:", error.message);
        return getMockNegotiationFallback(mode, message);
    }
};

// Helper for single generation call
const generateSingle = async (model, prompt) => {
    try {
        const result = await model.generateContent(prompt);
        return (await result.response).text();
    } catch (e) {
        console.error("Single generation error inside negotiation:", e.message);
        return "Simulated response unavailable due to API error.";
    }
}

// Helper to format the final string for the database
const formatNegotiationString = (data) => {
    return `**ChatGPT:**\n${data.chatgpt}\n\n**Gemini:**\n${data.gemini}\n\n**Claude:**\n${data.claude}\n\n**Final Optimized Response:**\n${data.final}`;
};

// Fallback logic if API key is missing or rate limited
const getMockNegotiationFallback = (mode, message) => {
    const data = {
        chatgpt: "API Error or Rate Limit reached for this model.",
        gemini: "Please select a different model from the dropdown above.",
        claude: "Some models have very strict free-tier quotas.",
        final: "⚠️ **Rate Limit Exceeded:** The selected AI model has hit its quota on your Google API key. Please select a different model from the dropdown menu at the top."
    };
    return {
        negotiationData: data,
        formattedString: formatNegotiationString(data)
    };
}

module.exports = { handleNegotiation };
