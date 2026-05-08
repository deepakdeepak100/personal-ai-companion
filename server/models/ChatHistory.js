const mongoose = require('mongoose');

const chatHistorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    mode: {
        type: String, // 'personal', 'professional', 'health', 'workout'
        required: true
    },
    role: {
        type: String, // 'user' or 'model'
        required: true
    },
    content: {
        type: String,
        required: true
    },
    negotiationData: {
        type: Object,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
