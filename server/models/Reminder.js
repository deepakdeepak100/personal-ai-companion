const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String, // 'pending', 'completed'
        default: 'pending'
    }
}, {
    timestamps: true
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
