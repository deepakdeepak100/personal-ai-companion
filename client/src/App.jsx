import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './utils/api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
// Import other pages later
// import Chat from './pages/Chat';
// import Reminders from './pages/Reminders';
import DashboardHelper from './DashboardHelper'; // Intermediate component to handle routing

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-dark text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

import { motion, AnimatePresence } from 'framer-motion';

// Global Reminders Poller
const ReminderPoller = () => {
    const { user, token } = useAuth();
    const [notifiedIds, setNotifiedIds] = useState(new Set());
    const [activeToasts, setActiveToasts] = useState([]);

    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            // Double beep pattern
            const triggerBeep = (startTime) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, startTime); // A5
                osc.frequency.exponentialRampToValueAtTime(1760, startTime + 0.1); 
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                
                osc.start(startTime);
                osc.stop(startTime + 0.3);
            };

            triggerBeep(ctx.currentTime);
            triggerBeep(ctx.currentTime + 0.4);

        } catch(e) { console.error("Audio blocked by browser policy:", e); }
    };

    useEffect(() => {
        if (!user || !token) return;

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkReminders = async () => {
            try {
                const res = await api.get('/api/reminders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const now = new Date();
                
                res.data.forEach(reminder => {
                    const reminderTime = new Date(reminder.date);
                    const timeDiff = now.getTime() - reminderTime.getTime();
                    
                    // Trigger if time has passed, and it's within the last 5 minutes (increased window)
                    const isDue = timeDiff >= 0 && timeDiff <= (5 * 60 * 1000); 

                    if (isDue && !notifiedIds.has(reminder._id)) {
                        setNotifiedIds(prev => new Set(prev).add(reminder._id));
                        triggerNotification(reminder);
                    }
                });
            } catch (error) {
                console.error("Reminder polling error:", error);
            }
        };

        checkReminders();
        const interval = setInterval(checkReminders, 10000); // check every 10 seconds

        return () => clearInterval(interval);
    }, [user, token, notifiedIds]);

    const triggerNotification = (reminder) => {
        // 1. Play Audio Alarm
        playBeep();

        // 2. OS Notification
        if (Notification.permission === 'granted') {
            new Notification("Smart Reminder", {
                body: reminder.title,
                icon: '/vite.svg',
                requireInteraction: true 
            });
        }
        
        // 3. In-App Visual Toast
        const newToast = { id: Date.now(), ...reminder };
        setActiveToasts(prev => [...prev, newToast]);
        
        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            removeToast(newToast.id);
        }, 15000);
    };

    const removeToast = (id) => {
        setActiveToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {activeToasts.map(toast => (
                    <motion.div 
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="bg-gradient-to-r from-primary to-purple-600 shadow-2xl shadow-primary/40 rounded-2xl p-5 w-72 pointer-events-auto border border-white/20"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold flex items-center gap-2 text-lg">
                                <span className="animate-bounce origin-bottom">🔔</span> Reminder!
                            </h4>
                            <button onClick={() => removeToast(toast.id)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors">
                                ✕
                            </button>
                        </div>
                        <p className="text-white/95 font-medium leading-snug">{toast.title}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

function AppRoutes() {
  return (
    <>
      <ReminderPoller />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHelper mode="personal" />} />
          <Route path="professional" element={<DashboardHelper mode="professional" />} />
          <Route path="health" element={<DashboardHelper mode="health" />} />
          <Route path="workout" element={<DashboardHelper mode="workout" />} />
          <Route path="reminders" element={<DashboardHelper mode="reminders" />} /> {/* Will replace with actual Reminders component */}
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
