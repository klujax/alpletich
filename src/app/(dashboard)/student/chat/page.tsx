'use client';

import { useEffect, useState, useRef } from 'react';
import { dataService, authService, Message, MOCK_USERS } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ImagePlus, User, Check, CheckCheck, RefreshCw } from 'lucide-react';


export const dynamic = 'force-dynamic';

export default function StudentChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Koç ID'si (demo için sabit)
    const coachId = '1';
    const coach = MOCK_USERS.find(u => u.id === coachId);

    useEffect(() => {
        loadData();

        // Canlı sohbet için 3 saniyede bir mesajları yenile
        const interval = setInterval(() => {
            refreshMessages();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadData = async () => {
        const user = authService.getUser();
        setCurrentUser(user);

        if (user) {
            const msgs = await dataService.getMessages(user.id, coachId);
            setMessages(msgs);
            await dataService.markMessagesAsRead(user.id, coachId);
        }
        setIsLoading(false);
    };

    const refreshMessages = async () => {
        const user = authService.getUser();
        if (user) {
            const msgs = await dataService.getMessages(user.id, coachId);
            setMessages(msgs);
            await dataService.markMessagesAsRead(user.id, coachId);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        setIsSending(true);
        await dataService.sendMessage(currentUser.id, coachId, newMessage.trim());
        setNewMessage('');

        // Mesajları yenile
        const msgs = await dataService.getMessages(currentUser.id, coachId);
        setMessages(msgs);
        setIsSending(false);
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        // Dosyayı base64'e çevir
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setIsSending(true);
            await dataService.sendMessage(currentUser.id, coachId, '📷 Fotoğraf gönderildi', base64);
            const msgs = await dataService.getMessages(currentUser.id, coachId);
            setMessages(msgs);
            setIsSending(false);
        };
        reader.readAsDataURL(file);

        // Input'u temizle
        e.target.value = '';
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Bugün';
        if (date.toDateString() === yesterday.toDateString()) return 'Dün';
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="font-bold text-slate-900">{coach?.full_name || 'Koç'}</h2>
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Çevrimiçi
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Canlı
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Send className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Sohbete Başla</h3>
                        <p className="text-slate-500 max-w-xs">
                            Koçunuzla iletişime geçin, sorularınızı sorun veya ilerleme fotoğraflarınızı paylaşın.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isMe = message.senderId === currentUser?.id;
                            const showDate = index === 0 ||
                                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

                            return (
                                <div key={message.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                                                {formatDate(message.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                                            <div
                                                className={`px-4 py-3 rounded-2xl shadow-sm ${isMe
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-md'
                                                    : 'bg-white text-slate-900 border border-slate-100 rounded-bl-md'
                                                    }`}
                                            >
                                                {message.imageUrl && (
                                                    <img
                                                        src={message.imageUrl}
                                                        alt="Paylaşılan fotoğraf"
                                                        className="rounded-xl mb-2 max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(message.imageUrl, '_blank')}
                                                    />
                                                )}
                                                <p className="font-medium">{message.content}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatTime(message.timestamp)}
                                                </span>
                                                {isMe && (
                                                    message.read
                                                        ? <CheckCheck className="w-3 h-3 text-green-500" />
                                                        : <Check className="w-3 h-3 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleImageUpload}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                    >
                        <ImagePlus className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        placeholder="Mesajınızı yazın..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-100 rounded-full border-0 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-medium text-slate-900 placeholder-slate-400"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="w-12 h-12 rounded-full p-0 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}

