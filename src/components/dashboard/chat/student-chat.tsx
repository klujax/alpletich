'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { dataService, authService, Message, MOCK_USERS } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Send, ImagePlus, User, Check, CheckCheck, Smile, Lock } from 'lucide-react';

export function StudentChat() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const coachId = '1';
    const coach = MOCK_USERS.find(u => u.id === coachId);

    useEffect(() => {
        loadData();
        const interval = setInterval(() => { refreshMessages(); }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadData = async () => {
        const user = authService.getUser();
        setCurrentUser(user);
        if (user) {
            try {
                // Check if student has chat permission
                const hasAccess = await (dataService as any).canStudentChat(user.id, coachId);
                setCanChat(hasAccess);

                const msgs = await dataService.getMessages(user.id, coachId);
                setMessages(msgs);
                await dataService.markMessagesAsRead(user.id, coachId);
            } catch (error) {
                console.error("Error loading chat data:", error);
                setCanChat(false);
            }
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
        if (!newMessage.trim() || !currentUser || !canChat) return;

        setIsSending(true);
        await dataService.sendMessage(currentUser.id, coachId, newMessage.trim());
        setNewMessage('');

        const msgs = await dataService.getMessages(currentUser.id, coachId);
        setMessages(msgs);
        setIsSending(false);
        inputRef.current?.focus();
    };

    const handleImageUpload = () => {
        if (!canChat) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser || !canChat) return;

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
        e.target.value = '';
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[100dvh] lg:h-[calc(100vh-5rem)] flex flex-col lg:rounded-2xl overflow-hidden lg:border lg:border-slate-200 lg:shadow-xl bg-white lg:max-w-3xl lg:mx-auto">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0 shadow-sm z-10">
                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 shadow-sm shadow-green-500/10 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        {coach?.avatar_url ? (
                            <img src={coach.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-sm truncate">{coach?.full_name || 'Koç'}</h3>
                    <p className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Çevrimiçi
                    </p>
                </div>
                <div className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Canlı
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f0f2f5]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                            {canChat ? (
                                <Send className="w-8 h-8 text-green-500" />
                            ) : (
                                <Lock className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                        <h3 className="text-base font-black text-slate-700 mb-1">Sohbete Başla</h3>
                        <p className="text-xs text-slate-500 font-medium max-w-[240px]">
                            {canChat
                                ? `Koçunuz ${coach?.full_name} ile mesajlaşmaya başlayın. Sorularınızı sorun, ilerlemenizi paylaşın.`
                                : 'Koçunuzla mesajlaşmak için sohbet desteği içeren bir paket satın almalısınız.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((message, index) => {
                            const isMe = message.senderId === currentUser?.id;
                            const showDate = index === 0 ||
                                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
                            const prevSame = index > 0 && messages[index - 1].senderId === message.senderId;

                            return (
                                <div key={message.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-3">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-500 shadow-sm">
                                                {formatDate(message.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${!prevSame ? 'mt-3' : 'mt-0.5'}`}>
                                        <div className="max-w-[75%]">
                                            <div
                                                className={`px-3 py-2 shadow-sm ${isMe
                                                    ? 'bg-[#dcf8c6] text-slate-900 rounded-xl rounded-tr-sm'
                                                    : 'bg-white text-slate-900 rounded-xl rounded-tl-sm'
                                                    } ${!prevSame && isMe ? 'rounded-tr-xl' : ''} ${!prevSame && !isMe ? 'rounded-tl-xl' : ''}`}
                                            >
                                                {message.imageUrl && (
                                                    <img
                                                        src={message.imageUrl}
                                                        alt="Paylaşılan fotoğraf"
                                                        className="rounded-lg mb-1.5 max-w-full max-h-52 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(message.imageUrl, '_blank')}
                                                    />
                                                )}
                                                <div className="flex items-end gap-2">
                                                    <p className="text-[13px] leading-relaxed font-medium break-words">{message.content}</p>
                                                    <span className={`text-[10px] font-medium shrink-0 flex items-center gap-0.5 translate-y-[1px] ${isMe ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {formatTime(message.timestamp)}
                                                        {isMe && (
                                                            message.read
                                                                ? <CheckCheck className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
                                                                : <Check className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 bg-[#f0f2f5] border-t border-slate-200 shrink-0">
                {canChat ? (
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleImageUpload}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-green-600 hover:bg-white transition-all shrink-0"
                        >
                            <ImagePlus className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Mesaj yazın..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white rounded-full border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all placeholder-slate-400 pr-10"
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Smile className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${newMessage.trim()
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center justify-between gap-3 px-2 py-1">
                        <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                            <Lock className="w-4 h-4 shrink-0" />
                            <p>Sohbet etmek için uygun bir paketiniz yok.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => router.push('/student/shop')}
                        >
                            Paket İncele
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
