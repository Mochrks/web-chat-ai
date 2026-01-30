import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import NextImage from 'next/image'
import { Send, Image as ImageIcon, X, Mic } from 'lucide-react'
import MessageList from '@/components/demo/MessageList'
import { useChat } from '@/context/ChatContext'
import { useLanguage } from '@/context/LanguageContext'

export default function ChatArea() {
    const { data: session } = useSession()
    const { messages, sendMessage, loading } = useChat()
    const { t } = useLanguage()
    const [input, setInput] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [initialQuestion, setInitialQuestion] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isListening, setIsListening] = useState(false);

    // Auto-scroll to bottom when messages change
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    const handleInitialSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (initialQuestion.trim()) {
            sendMessage(initialQuestion)
            setInitialQuestion('')
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((input.trim() || selectedFile) && !loading) {
            await sendMessage(input, selectedFile || undefined)
            setInput('')
            setSelectedFile(null)
            setPreviewUrl(null)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const recognitionRef = useRef<any>(null);
    const [listeningText, setListeningText] = useState('');
    const transcriptRef = useRef('');
    const [finalTranscript, setFinalTranscript] = useState<string | null>(null);

    useEffect(() => {
        if (finalTranscript) {
            if (messages.length === 0) {
                setInitialQuestion(prev => (prev ? prev + ' ' : '') + finalTranscript);
            } else {
                setInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
            }
            setFinalTranscript(null);
        }
    }, [finalTranscript, messages.length]);

    const handleStartListening = () => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;
                recognition.continuous = false;
                recognition.interimResults = true;

                recognition.onstart = () => {
                    setIsListening(true);
                    setListeningText('');
                    transcriptRef.current = '';
                };

                recognition.onend = () => {
                    setIsListening(false);
                    if (transcriptRef.current) {
                        setFinalTranscript(transcriptRef.current);
                    }
                    setListeningText('');
                    transcriptRef.current = '';
                };

                recognition.onresult = (event: any) => {
                    // Loop is good for continuous, but for single sentence:
                    const results = Array.from(event.results);
                    const transcript = results.map((result: any) => result[0].transcript).join('');

                    setListeningText(transcript);
                    transcriptRef.current = transcript;
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                recognition.start();
            } else {
                alert("Speech recognition not supported in this browser.");
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const greetingsRaw = t('chat.greetings');
    const greetings = Array.isArray(greetingsRaw) ? greetingsRaw : ["Hello"];
    const [currentGreeting, setCurrentGreeting] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentGreeting((prev) => (prev + 1) % greetings.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [greetings.length]);

    return (
        <div className="flex flex-col h-full w-full justify-center relative">
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="size-32 rounded-full bg-red-500/20 absolute inset-0 blur-xl"
                            />
                            <div className="size-32 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center relative z-10">
                                <Mic className="h-12 w-12 text-white" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mt-8 mb-4">{t('chat.voiceListening')}</h3>
                        <p className="text-xl text-slate-300 text-center max-w-2xl font-medium min-h-[3rem]">
                            {listeningText || t('chat.voiceStartDataPlaceholder')}
                        </p>

                        <button
                            onClick={stopListening}
                            className="mt-12 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all font-medium"
                        >
                            {t('chat.voiceStop')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className='py-5 min-h-[100px] flex items-center justify-center'>
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={currentGreeting}
                                initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                                transition={{ duration: 0.5 }}
                                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4 text-center"
                            >
                                {greetings[currentGreeting]}
                            </motion.h1>
                        </AnimatePresence>
                    </div>
                    <form onSubmit={handleInitialSearch} className="w-full max-w-xl relative group z-10 transition-all">
                        <div className="glass-panel input-glow rounded-3xl p-1.5 flex items-center transition-all duration-300 border border-white/10">
                            <input
                                value={initialQuestion}
                                onChange={(e) => setInitialQuestion(e.target.value)}
                                placeholder={t('chat.initialPlaceholder')}
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder:text-slate-500 px-6 text-base font-medium h-12"
                            />
                            <div className="flex items-center gap-1 pr-1">
                                <button
                                    type="button"
                                    onClick={handleStartListening}
                                    className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                    title={t('chat.voiceInput')}
                                >
                                    <span className="material-symbols-outlined text-[22px]">mic</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40 hover:scale-105 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-xl">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    </form>

                    <div className="absolute bottom-6 text-center">
                        <p className="text-[10px] text-slate-600">
                            &copy; 2025 {t('chat.created')} <a href="https://github.com/Mochrks" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white underline decoration-slate-600 underline-offset-2 transition-colors">Mochrks</a>
                        </p>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col w-full h-full overflow-hidden relative'>
                    {/* Scrollable Message Area - Full Width to keep scrollbar on right */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                        <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
                            <div className="flex-1 p-4">
                                <MessageList messages={messages} userImage={session?.user?.image} />
                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        </div>
                    </div>

                    {/* Input Area - Fixed at bottom, centered content */}
                    <div className="w-full shrink-0 z-10 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent pt-4 pb-6">
                        <div className="max-w-5xl mx-auto px-6">
                            <div className="max-w-4xl mx-auto relative group">
                                {previewUrl && (
                                    <div className="absolute bottom-full mb-4 left-0 bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10">
                                        <div className="relative inline-block">
                                            <NextImage src={previewUrl} alt={t('chat.preview')} width={80} height={80} className="rounded-lg object-cover" />
                                            <button
                                                onClick={clearFile}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-sm"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="glass-panel input-glow rounded-3xl p-2 flex items-center transition-all duration-300 border border-white/10 bg-black/20 backdrop-blur-xl">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all text-2xl"
                                    >
                                        <span className="material-symbols-outlined text-[22px]">add_circle</span>
                                    </button>

                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleSend(e)
                                            }
                                        }}
                                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder:text-slate-500 px-4 text-base font-medium"
                                        placeholder={t('chat.inputPlaceholder')}
                                        type="text"
                                    />

                                    <div className="flex items-center gap-2 pr-1">
                                        <button
                                            onClick={handleStartListening}
                                            className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                            title={t('chat.voiceInput')}
                                        >
                                            <span className="material-symbols-outlined text-[22px]">mic</span>
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={(!input.trim() && !selectedFile) || loading}
                                            className="size-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Decorative Glow beneath input */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            </div>
                            <p className="text-center text-[10px] text-slate-600 mt-4 font-medium uppercase tracking-tighter">{t('chat.modelWarning')}</p>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-slate-600">
                                    &copy; 2025 {t('chat.created')} <a href="https://github.com/Mochrks" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white underline decoration-slate-600 underline-offset-2 transition-colors">Mochrks</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}