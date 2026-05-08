import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import { Send, Trash2, Bot, User as UserIcon, BrainCircuit, X, ChevronDown, Check, Copy } from 'lucide-react';
import { cn } from '../utils/cn';

const DebateModal = ({ data, onClose }) => {
    if (!data) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BrainCircuit size={20} className="text-secondary" /> AI Experts Debate
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1" title="Close">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar text-sm sm:text-base">
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold border-b border-slate-700/50 pb-2">
                            <BrainCircuit size={16} /> ChatGPT
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.chatgpt}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold border-b border-slate-700/50 pb-2">
                            <BrainCircuit size={16} /> Gemini
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.gemini}</p>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-2 text-orange-400 font-semibold border-b border-slate-700/50 pb-2">
                            <BrainCircuit size={16} /> Claude
                        </div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.claude}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NegotiationWidget = ({ data, onPhaseChange, onComplete }) => {
    const [phase, setPhase] = useState(0);
    const callbacks = useRef({ onPhaseChange, onComplete });

    useEffect(() => {
        callbacks.current = { onPhaseChange, onComplete };
    }, [onPhaseChange, onComplete]);

    useEffect(() => {
        const timings = [
            1200, // 0->1: ChatGPT processing
            1500, // 1->2: Show ChatGPT, start Gemini
            1500, // 2->3: Show Gemini, start Claude
            1500, // 3->4: Show Claude, start Synthesis
            1800, // 4->5: Show Synthesis processing
            200   // 5->Done (triggers onComplete)
        ];

        let currentPhase = 0;
        let activeTimer = null;
        
        const nextPhase = () => {
            if (currentPhase < timings.length) {
                activeTimer = setTimeout(() => {
                    currentPhase++;
                    setPhase(currentPhase);
                    callbacks.current.onPhaseChange(); 
                    if (currentPhase === timings.length) {
                        callbacks.current.onComplete(); 
                    } else {
                        nextPhase();
                    }
                }, timings[currentPhase - 1]);
            }
        };

        const timer = setTimeout(() => {
            setPhase(1);
            currentPhase = 1;
            callbacks.current.onPhaseChange();
            nextPhase();
        }, 800);

        return () => {
            clearTimeout(timer);
            if (activeTimer) clearTimeout(activeTimer);
        };
    }, []);

    return (
        <div className="space-y-4 w-full text-sm sm:text-base">
            {/* ChatGPT */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 p-4 rounded-xl border border-blue-500/20 shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold border-b border-slate-700/50 pb-2">
                    <BrainCircuit size={16} /> ChatGPT
                </div>
                {phase < 1 ? (
                    <div className="text-slate-400 italic flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                        Analyzing the query...
                    </div>
                ) : (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.chatgpt}</p>
                )}
            </motion.div>

            {/* Gemini */}
            {phase >= 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 p-4 rounded-xl border border-purple-500/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold border-b border-slate-700/50 pb-2">
                        <BrainCircuit size={16} /> Gemini
                    </div>
                    {phase < 3 ? (
                        <div className="text-slate-400 italic flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></div>
                            Discussing the analysis...
                        </div>
                    ) : (
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.gemini}</p>
                    )}
                </motion.div>
            )}

            {/* Claude */}
            {phase >= 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 p-4 rounded-xl border border-orange-500/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-orange-400 font-semibold border-b border-slate-700/50 pb-2">
                        <BrainCircuit size={16} /> Claude
                    </div>
                    {phase < 5 ? (
                        <div className="text-slate-400 italic flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                            Providing careful perspective...
                        </div>
                    ) : (
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.claude}</p>
                    )}
                </motion.div>
            )}

            {/* Synthesizer */}
            {phase >= 6 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary/10 p-5 rounded-xl border border-primary/30 mt-6 shadow-xl shadow-primary/5">
                    <div className="flex items-center gap-2 mb-3 text-primary font-bold border-b border-primary/20 pb-2">
                        <Bot size={20} /> Final Synthesized Response
                    </div>
                    <div className="text-primary/70 italic flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        Generating optimal, safe answer...
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const Chat = ({ mode }) => {
    const { token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDebateData, setViewDebateData] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(1);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const AVAILABLE_ACCOUNTS = [
        { id: 1, name: 'Account 1' },
        { id: 2, name: 'Account 2' },
        { id: 3, name: 'Account 3' },
        { id: 4, name: 'Account 4' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchHistory();
    }, [mode]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/api/chat/${mode}`);
            setMessages(res.data.map(msg => ({ ...msg, isLive: false })));
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input, mode, isNew: true };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post(`/api/chat/${mode}`, { message: userMsg.content, apiKeyIndex: selectedAccount });
            setMessages(prev => [...prev.map(m => ({...m, isNew: false})), { ...res.data, isLive: true, isNew: true }]);
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again.", error: true, isNew: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm("Are you sure you want to clear this conversation?")) return;
        try {
            await api.delete(`/api/chat/${mode}`);
            setMessages([]);
        } catch (error) {
            console.error("Failed to clear history", error);
        }
    };

    const getModeTitle = () => {
        switch (mode) {
            case 'personal': return 'Personal Chat';
            case 'professional': return 'Professional Assistant';
            case 'health': return 'Health Assistant';
            case 'workout': return 'Workout Coach';
            default: return 'Chat';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-screen bg-transparent w-full relative z-10">
            <DebateModal data={viewDebateData} onClose={() => setViewDebateData(null)} />
            
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-5 border-b border-slate-800/50 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                        <Bot className="text-primary" size={24} />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{getModeTitle()}</h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* Account Selector Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-colors shadow-sm"
                        >
                            <span className="hidden sm:inline">API Key:</span> 
                            <span className="text-white">{AVAILABLE_ACCOUNTS.find(m => m.id === selectedAccount)?.name}</span>
                            <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isAccountMenuOpen && "rotate-180")} />
                        </button>
                        
                        <AnimatePresence>
                            {isAccountMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                                >
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 mb-1">
                                        Select Account
                                    </div>
                                    {AVAILABLE_ACCOUNTS.map(account => (
                                        <button
                                            key={account.id}
                                            onClick={() => {
                                                setSelectedAccount(account.id);
                                                setIsAccountMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700/50 flex items-center justify-between transition-colors group"
                                        >
                                            <span className={cn(
                                                "font-medium transition-colors", 
                                                selectedAccount === account.id ? "text-primary" : "text-slate-300 group-hover:text-white"
                                            )}>
                                                {account.name}
                                            </span>
                                            {selectedAccount === account.id && <Check size={16} className="text-primary" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleClear}
                        className="p-2.5 text-slate-400 border border-transparent hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 rounded-xl transition-all font-medium flex items-center gap-2 text-sm"
                        title="Clear Conversation"
                    >
                        <Trash2 size={16} /> <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar scroll-smooth">
                {messages.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4"
                    >
                        <div className="p-6 rounded-full bg-slate-800/30 border border-slate-700/50 shadow-inner">
                            <Bot size={64} className="text-primary opacity-80" />
                        </div>
                        <p className="text-xl font-medium text-slate-300">Start a conversation with your {mode} assistant!</p>
                        <p className="text-sm opacity-60">Send a message below to begin.</p>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={msg.isNew ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className={cn(
                            "flex gap-4 w-full max-w-4xl mx-auto items-start",
                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
                            msg.role === 'user' ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-800 border border-slate-700"
                        )}>
                            {msg.role === 'user' ? <UserIcon size={20} className="text-white" /> : <Bot size={20} className="text-secondary" />}
                        </div>

                        <div className={cn(
                            "flex flex-col gap-1 w-full max-w-[85%]",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}>
                            {msg.role === 'user' && <span className="text-xs text-slate-500 font-medium px-1">You</span>}
                            {msg.role === 'model' && <span className="text-xs text-slate-500 font-medium px-1">AI Assistant</span>}
                            
                            {(msg.negotiationData && msg.isLive) ? (
                                <NegotiationWidget 
                                    data={msg.negotiationData} 
                                    onPhaseChange={scrollToBottom} 
                                    onComplete={() => {
                                        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, isLive: false } : m));
                                    }}
                                />
                            ) : (
                                <div className={cn(
                                    "px-5 py-3.5 rounded-2xl shadow-sm w-fit animate-in fade-in",
                                    msg.role === 'user'
                                        ? "bg-primary text-white rounded-tr-sm"
                                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                                )}>
                                    {/* Markdown bold formatting rendered as bold */}
                                    <div 
                                        className="whitespace-pre-wrap leading-relaxed [&>strong]:text-white [&>strong]:font-bold" 
                                        dangerouslySetInnerHTML={{ __html: (msg.content || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
                                    />
                                    {(msg.role === 'model' || msg.negotiationData) && (
                                        <div className="mt-4 border-t border-slate-700/60 pt-3 flex justify-end gap-2">
                                            {msg.role === 'model' && (
                                                <button
                                                    onClick={() => {
                                                        const textToCopy = msg.content ? `${msg.content} Rc:9` : "Rc:9";
                                                        navigator.clipboard.writeText(textToCopy);
                                                    }}
                                                    className="text-xs font-medium text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                                                    title="Copy Response"
                                                >
                                                    <Copy size={14} /> Copy
                                                </button>
                                            )}
                                            {msg.negotiationData && (
                                                <button 
                                                    onClick={() => setViewDebateData(msg.negotiationData)}
                                                    className="text-xs font-medium text-secondary hover:text-white bg-slate-900/50 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    <BrainCircuit size={14} /> View AI Debate
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>

                {loading && (
                    <div className="flex gap-4 max-w-4xl mx-auto w-full items-start">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                            <Bot size={20} className="text-secondary" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl bg-slate-800 rounded-tl-sm border border-slate-700 shadow-sm w-fit">
                            <div className="flex space-x-2 items-center h-4">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-slate-900/40 border-t border-slate-800/50 backdrop-blur-xl relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-3xl border border-slate-700/50 shadow-inner group focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(124,58,ed,0.15)] transition-all duration-300">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${mode} assistant...`}
                        className="flex-1 bg-transparent text-white placeholder-slate-500 px-5 py-3.5 focus:outline-none transition-all"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-3.5 aspect-square rounded-2xl shadow-lg shadow-primary/20 flex-shrink-0 group-focus-within:bg-primary group-focus-within:text-white transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Send size={20} className={cn("transition-transform duration-300", input.trim() ? "translate-x-0.5 -translate-y-0.5" : "")} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
