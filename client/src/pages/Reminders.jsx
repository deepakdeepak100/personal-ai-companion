import { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import { Trash2, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Reminders = () => {
    const { token } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await api.get('/api/reminders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(res.data);
        } catch (error) {
            console.error("Failed to fetch reminders", error);
        }
    };

    const addReminder = async (e) => {
        e.preventDefault();
        if (!title || !date || !time) return;

        setLoading(true);
        // Combine date and time
        const dateTime = new Date(`${date}T${time}`);

        try {
            const res = await api.post('/api/reminders', {
                title,
                date: dateTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders([...reminders, res.data]);
            setTitle('');
            setDate('');
            setTime('');
        } catch (error) {
            console.error("Failed to add reminder", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteReminder = async (id) => {
        if (!window.confirm("Delete this reminder?")) return;
        try {
            await api.delete(`/api/reminders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(reminders.filter(r => r._id !== id));
        } catch (error) {
            console.error("Failed to delete reminder", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-6 max-w-4xl mx-auto space-y-8 relative z-10"
        >
            <header className="mb-8">
                <motion.h1 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent drop-shadow-sm"
                >
                    Smart Reminders
                </motion.h1>
                <motion.p 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-slate-400 mt-2 text-lg"
                >
                    Never miss a task again
                </motion.p>
            </header>

            {/* Add Reminder Form */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/20"
            >
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Calendar className="text-primary" /> Add New Reminder
                </h2>
                <form onSubmit={addReminder} className="grid md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <Input
                            label="Task Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Drink water"
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="Time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" isLoading={loading} className="md:col-span-4 mt-4 h-12 text-lg shadow-primary/20 shadow-lg">
                        Set Reminder
                    </Button>
                </form>
            </motion.div>

            {/* Reminders List */}
            <div className="space-y-6 mt-8">
                <h2 className="text-2xl font-semibold text-white tracking-tight">Upcoming</h2>
                {reminders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-16 text-slate-500 bg-slate-800/20 backdrop-blur-sm border border-dashed border-slate-700 rounded-3xl"
                    >
                        <Calendar size={56} className="mx-auto mb-4 opacity-20 text-primary" />
                        <p className="text-lg">No reminders set yet.</p>
                        <p className="text-sm mt-1 opacity-70">Take a break or set a new goal above!</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <AnimatePresence>
                            {reminders.map((reminder) => (
                                <motion.div 
                                    key={reminder._id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    layout
                                    className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4 overflow-hidden">
                                        <div className="mt-1 p-2.5 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                                            <Clock size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-white text-lg truncate mb-0.5">{reminder.title}</h3>
                                            <p className="text-sm text-slate-400 font-medium">
                                                {format(new Date(reminder.date), 'PPP p')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteReminder(reminder._id)}
                                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 hover:shadow-inner rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                        title="Delete Reminder"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Reminders;
