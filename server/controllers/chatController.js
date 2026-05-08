const ChatHistory = require('../models/ChatHistory');
const { generateResponse } = require('../services/aiService');
const { handleNegotiation } = require('../services/modelNegotiationLayer');

// @desc    Send a message and get response
// @route   POST /api/chat/:mode
// @access  Private
const sendMessage = async (req, res) => {
    const { message, apiKeyIndex } = req.body;
    const { mode } = req.params;
    const userId = req.user._id;

    if (!message) {
        res.status(400);
        res.json({ message: 'Message is required' });
        return;
    }

    try {
        let aiResponseContent = '';
        let negotiationData = null;

        // 1. Route based on mode
        if (mode === 'health' || mode === 'workout') {
            const negotiationResult = await handleNegotiation(mode, message, apiKeyIndex);
            aiResponseContent = negotiationResult.formattedString;
            negotiationData = negotiationResult.negotiationData;
        } else {
            // Personal or Professional
            aiResponseContent = await generateResponse(mode, message, apiKeyIndex);
        }

        // 2. Save User Message
        await ChatHistory.create({
            user: userId,
            mode: mode,
            role: 'user',
            content: message
        });

        // 3. Save AI Response
        const responseToSave = {
            user: userId,
            mode: mode,
            role: 'model',
            content: aiResponseContent
        };
        
        if (negotiationData) {
            responseToSave.negotiationData = negotiationData;
        }

        const savedResponse = await ChatHistory.create(responseToSave);

        // 4. Return to client. If negotiation happened, attach the raw data for animation.
        const responseData = savedResponse.toObject();
        if (negotiationData) {
            responseData.negotiationData = negotiationData;
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get chat history for a mode
// @route   GET /api/chat/:mode
// @access  Private
const getChatHistory = async (req, res) => {
    const { mode } = req.params;
    const userId = req.user._id;

    try {
        const history = await ChatHistory.find({ user: userId, mode: mode }).sort({ createdAt: 1 });
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Clear chat history for a mode
// @route   DELETE /api/chat/:mode
// @access  Private
const clearChatHistory = async (req, res) => {
    const { mode } = req.params;
    const userId = req.user._id;

    try {
        await ChatHistory.deleteMany({ user: userId, mode: mode });
        res.status(200).json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    sendMessage,
    getChatHistory,
    clearChatHistory
};
