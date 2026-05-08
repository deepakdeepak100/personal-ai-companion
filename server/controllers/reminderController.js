const Reminder = require('../models/Reminder');

// @desc    Get reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user.id });
        res.status(200).json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Set reminder
// @route   POST /api/reminders
// @access  Private
const setReminder = async (req, res) => {
    if (!req.body.title || !req.body.date) {
        res.status(400);
        res.json({ message: 'Please add a title and date' });
        return;
    }

    try {
        const reminder = await Reminder.create({
            title: req.body.title,
            date: req.body.date,
            user: req.user.id
        });
        res.status(200).json(reminder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            res.status(404);
            res.json({ message: 'Reminder not found' });
            return;
        }

        // Check for user
        if (!req.user) {
            res.status(401);
            res.json({ message: 'User not found' });
            return;
        }

        // Make sure the logged in user matches the reminder user
        if (reminder.user.toString() !== req.user.id) {
            res.status(401);
            res.json({ message: 'User not authorized' });
            return;
        }

        await reminder.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getReminders,
    setReminder,
    deleteReminder
};
