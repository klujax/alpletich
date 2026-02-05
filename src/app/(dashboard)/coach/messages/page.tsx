'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Send, User, MoreVertical, Image as ImageIcon, Phone, Video, ArrowLeft } from 'lucide-react';
import { authService, dataService, Message, Profile } from '@/lib/mock-service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Conversation {
    partner: Profile;
    lastMessage?: Message; // Optional yapıyoruz çünkü henüz mesaj olmayabilir
    unreadCount: number;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInitialData();

        // Polling for new messages (simulated real-time)
        const interval = setInterval(() => {
            if (currentUser) {
                loadConversations(currentUser.id);
                if (selectedPartner) {
                    loadMessages(currentUser.id, selectedPartner.id);
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedPartner]); // Re-run polling setup if selected partner changes

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadInitialData = async () => {
        setIsLoading(true);
        const user = authService.getUser();
        if (user) {
            setCurrentUser(user);
            await loadConversations(user.id);
        }
        setIsLoading(false);
    };

    const loadConversations = async (userId: string) => {
        // 1. Mevcut konuşmaları çek
        const activeConvs = await dataService.getConversations(userId);

        // 2. Eğer kullanıcı KOÇ ise, mesaj geçmişi olmayan öğrencileri de listeye ekle
        let allConversations: Conversation[] = [...activeConvs];

        if (currentUser?.role === 'coach') {
            const students = await dataService.getStudents();

            // Konuşma listesinde olmayan öğrencileri bul
            const newStudents = students.filter((student: Profile) =>
                !activeConvs.some(conv => conv.partner.id === student.id)
            );

            // Onları da listeye ekle (boş mesaj geçmişi ile)
            const emptyConvs: Conversation[] = newStudents.map((student: Profile) => ({
                partner: student,
                unreadCount: 0,
                lastMessage: undefined
            }));

            allConversations = [...allConversations, ...emptyConvs];
        }

        setConversations(allConversations);
    };

    const loadMessages = async (userId: string, partnerId: string) => {
        const msgs = await dataService.getMessages(userId, partnerId);
        setMessages(msgs);

        // Mark as read logic would go here
        await dataService.markMessagesAsRead(userId, partnerId);
    };

    const handleSelectConversation = async (partner: Profile) => {
        setSelectedPartner(partner);
        if (currentUser) {
            await loadMessages(currentUser.id, partner.id);
            // Refresh conversations to update unread count
            loadConversations(currentUser.id);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedPartner) return;

        try {
            await dataService.sendMessage(currentUser.id, selectedPartner.id, newMessage);
            setNewMessage('');
            await loadMessages(currentUser.id, selectedPartner.id);
            await loadConversations(currentUser.id); // Update last message in sidebar
        } catch (error) {
            toast.error('Mesaj gönderilemedi');
        }
    };

    const filteredConversations = conversations.filter(c =>
        (c.partner.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div></div>;

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6 animate-in fade-in zoom-in duration-300">
            {/* Sidebar (Conversations List) */}
            <Card className={cn(
                "w-full md:w-80 flex flex-col border-slate-200 shadow-lg bg-white overflow-hidden",
                selectedPartner ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        Mesajlar
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Öğrenci ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8 px-4 text-slate-500 text-sm">
                            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz mesajlaşma yok'}
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.partner.id}
                                onClick={() => handleSelectConversation(conv.partner)}
                                className={cn(
                                    "w-full p-3 rounded-xl flex items-start gap-3 text-left transition-all",
                                    selectedPartner?.id === conv.partner.id
                                        ? "bg-green-50 ring-1 ring-green-100"
                                        : "hover:bg-slate-50"
                                )}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                                        {conv.partner.avatar_url ? (
                                            <img src={conv.partner.avatar_url} alt={conv.partner.full_name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    {/* Online indicator (mock) */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={cn("font-bold text-sm truncate", selectedPartner?.id === conv.partner.id ? "text-green-900" : "text-slate-900")}>
                                            {conv.partner.full_name || 'İsimsiz Kullanıcı'}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500")}>
                                        {conv.lastMessage ? (
                                            <>
                                                {conv.lastMessage.senderId === currentUser?.id && 'Sen: '}
                                                {conv.lastMessage.content}
                                            </>
                                        ) : (
                                            <span className="text-slate-400 italic">Mesajlaşma başlat</span>
                                        )}
                                    </p>
                                </div>

                                {conv.unreadCount > 0 && (
                                    <div className="min-w-[18px] h-[18px] rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-green-500/30">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </Card>

            {/* Chat Area */}
            <Card className={cn(
                "flex-1 flex-col border-slate-200 shadow-lg bg-white overflow-hidden",
                !selectedPartner ? "hidden md:flex" : "flex"
            )}>
                {selectedPartner ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2 text-slate-600"
                                    onClick={() => setSelectedPartner(null)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>

                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                    {selectedPartner.avatar_url ? (
                                        <img src={selectedPartner.avatar_url} alt={selectedPartner.full_name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        (selectedPartner.full_name || 'U').slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{selectedPartner.full_name || 'İsimsiz Kullanıcı'}</h3>
                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                                        Çevrimiçi
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[70%] rounded-2xl p-4 shadow-sm relative group",
                                            isMe
                                                ? "bg-green-600 text-white rounded-br-none"
                                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                                        )}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <span className={cn(
                                                "text-[10px] mt-1 block opacity-70",
                                                isMe ? "text-green-100 text-right" : "text-slate-400"
                                            )}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                            <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 shrink-0">
                                <ImageIcon className="w-5 h-5" />
                            </Button>
                            <input
                                type="text"
                                placeholder="Bir mesaj yazın..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 bg-slate-50 border-0 rounded-xl px-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all text-sm font-medium"
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={cn(
                                    "shrink-0 transition-all",
                                    newMessage.trim()
                                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                                        : "bg-slate-100 text-slate-400"
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <MessageCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Mesajlaşmaya Başla</h3>
                        <p className="max-w-xs text-center text-sm">
                            Sol taraftaki listeden bir öğrenci seçerek sohbete başlayabilirsin.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
