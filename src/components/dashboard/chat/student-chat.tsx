'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search, Send, ArrowLeft, Check, CheckCheck, Smile, ImagePlus, Lock, Store, Video } from 'lucide-react';
import { supabaseAuthService as authService, supabaseDataService as dataService } from '@/lib/supabase-service';
import { Purchase, GymStore, Message, Conversation } from '@/lib/types';
import { Profile } from '@/types/database';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';



export function StudentChat() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const partnerIdParam = searchParams.get('partner');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [canChat, setCanChat] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Realtime subscription
    useEffect(() => {
        const sub = dataService.subscribeToMessages((payload) => {
            if (!currentUser) return;

            const newMessage = payload.new;
            // If message belongs to current chat, add it
            if (selectedPartner && (
                (newMessage.sender_id === selectedPartner.id && newMessage.receiver_id === currentUser.id) ||
                (newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedPartner.id)
            )) {
                // Fetch logic or append?
                // payload.new is separate from "Message" type potentially (snake_case vs camelCase).
                // Let's just reload messages to be safe and consistent with "read" status etc.
                loadMessages(currentUser.id, selectedPartner.id);
            }

            // Always reload conversations to update unread counts and sorting
            loadConversations(currentUser.id);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [currentUser, selectedPartner]);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Handle URL param for partner selection
    useEffect(() => {
        if (currentUser && partnerIdParam && !selectedPartner) {
            // Find partner in conversations or fetch details
            const conv = conversations.find(c => c.partner.id === partnerIdParam);
            if (conv) {
                handleSelectConversation(conv.partner);
            } else {
                fetchCoachProfile(partnerIdParam);
            }
        }
    }, [partnerIdParam, currentUser, conversations]);

    const fetchCoachProfile = async (coachId: string) => {
        // Fallback: try to find store or just wait for conversation list
    };

    // Polling removed in favor of Realtime!
    // But maybe keep a slow poll just in case? Or rely on Realtime.
    // Let's remove the interval for now as Supabase Realtime is reliable.

    useEffect(() => {
        if (currentUser && selectedPartner) {
            checkChatPermission(currentUser.id, selectedPartner.id);
        }
    }, [currentUser, selectedPartner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkChatPermission = async (studentId: string, coachId: string) => {
        try {
            // Check active purchases
            const purchases = await dataService.getPurchases(studentId);
            const stores = await dataService.getStores();
            const coachStore = stores.find((s: GymStore) => s.coachId === coachId);

            // Allow if there is ANY active package from this coach (or their store)
            const hasActivePackage = purchases.some((p: Purchase) =>
                (p.coachId === coachId || (coachStore && p.shopId === coachStore.id)) &&
                p.status === 'active'
            );

            setCanChat(hasActivePackage);
        } catch (e) {
            console.error("Permission check failed", e);
            setCanChat(false);
        }
    };

    const loadInitialData = async () => {
        setIsLoading(true);
        const user = await authService.getUser();
        if (user) {
            setCurrentUser(user);
            await loadConversations(user.id);
        }
        setIsLoading(false);
    };

    const loadConversations = async (userId: string) => {
        const activeConvs = await dataService.getConversations(userId);
        let allConversations: Conversation[] = [...activeConvs];
        setConversations(allConversations);
    };

    const loadMessages = async (userId: string, partnerId: string) => {
        const msgs = await dataService.getMessages(userId, partnerId);
        setMessages(msgs);
        await dataService.markMessagesAsRead(userId, partnerId);
    };

    const handleSelectConversation = async (partner: Profile) => {
        setSelectedPartner(partner);
        if (currentUser) {
            await loadMessages(currentUser.id, partner.id);
            setCanChat(true); // default optimistic, effect will verify
        }
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !selectedPartner || !canChat) return;

        setIsSending(true);
        try {
            await dataService.sendMessage(currentUser.id, selectedPartner.id, newMessage);
            setNewMessage('');
            // No need to manually reload - Realtime subscription should handle it!
            // But for immediate UI feedback (latency compensation), we might want to?
            // Actually, realtime is fast enough usually. But typically we append locally then replace.
            // For now, let's wait for Realtime event which will reload.
            // reloadMessages called by subscription.

            // Wait, subscription receives the *new* message.
            // If I sent it, the subscription callback fires too.
            inputRef.current?.focus();
        } catch (error) {
            toast.error('Mesaj gönderilemedi');
        } finally {
            setIsSending(false);
        }
    };

    const handleImageUpload = () => {
        if (!canChat) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser || !selectedPartner || !canChat) return;

        setIsSending(true);
        try {
            const path = `chat/${Date.now()}_${file.name}`;
            const publicUrl = await dataService.uploadFile('message-images', path, file);

            await dataService.sendMessage(currentUser.id, selectedPartner.id, '📷 Fotoğraf', publicUrl);
            // Realtime will pick it up
        } catch (error) {
            toast.error('Görsel gönderilemedi');
            console.error(error);
        } finally {
            setIsSending(false);
            e.target.value = '';
        }
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

    // Filter conversations
    const filteredConversations = conversations.filter(c =>
        (c.partner.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    if (isLoading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-[100dvh] lg:h-[calc(100vh-5rem)] flex lg:rounded-2xl overflow-hidden lg:border lg:border-slate-200 lg:shadow-xl bg-white">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* ===== LEFT PANEL - COACHES LIST ===== */}
            <div className={cn(
                "w-full md:w-[360px] flex flex-col border-r border-slate-100 bg-white shrink-0",
                selectedPartner ? "hidden md:flex" : "flex"
            )}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-900">Koçlarım</h2>
                        {totalUnread > 0 && (
                            <div className="min-w-[24px] h-6 rounded-full bg-green-600 text-white text-xs font-black flex items-center justify-center px-2">
                                {totalUnread}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Koç ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 focus:bg-white transition-all placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                <MessageCircle className="w-7 h-7 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium">
                                {searchQuery ? 'Sonuç bulunamadı' : 'Henüz mesaj geçmişiniz yok'}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const isSelected = selectedPartner?.id === conv.partner.id;
                            return (
                                <button
                                    key={conv.partner.id}
                                    onClick={() => handleSelectConversation(conv.partner)}
                                    className={cn(
                                        "w-full px-4 py-3.5 flex items-center gap-3.5 text-left transition-all border-b border-slate-50 hover:bg-slate-50",
                                        isSelected && "bg-green-50 hover:bg-green-50 border-l-[3px] border-l-green-500"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center text-sm font-black overflow-hidden border-2",
                                            isSelected
                                                ? "border-green-400 shadow-sm shadow-green-500/20"
                                                : "border-slate-200"
                                        )}>
                                            {conv.partner.avatar_url ? (
                                                <img src={conv.partner.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white">
                                                    {(conv.partner.full_name || 'K').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className={cn(
                                                "text-sm truncate",
                                                conv.unreadCount > 0 ? "font-black text-slate-900" : "font-bold text-slate-700"
                                            )}>
                                                {conv.partner.full_name || 'Koç'}
                                            </h3>
                                            <span className={cn(
                                                "text-[10px] font-bold shrink-0 ml-2",
                                                conv.unreadCount > 0 ? "text-green-600" : "text-slate-400"
                                            )}>
                                                {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "text-xs truncate pr-2",
                                                conv.unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500 font-medium"
                                            )}>
                                                {conv.lastMessage ? (
                                                    <>
                                                        {conv.lastMessage.senderId === currentUser?.id && (
                                                            <span className="text-green-600 mr-1">
                                                                {conv.lastMessage.read ? '✓✓' : '✓'}
                                                            </span>
                                                        )}
                                                        {conv.lastMessage.content}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 italic">Sohbet başlat →</span>
                                                )}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <div className="min-w-[20px] h-5 rounded-full bg-green-600 text-white text-[10px] font-black flex items-center justify-center px-1.5 shrink-0">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ===== RIGHT PANEL - CHAT AREA ===== */}
            <div className={cn(
                "flex-1 flex flex-col bg-white min-w-0",
                !selectedPartner ? "hidden md:flex" : "flex"
            )}>
                {selectedPartner ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0 shadow-sm z-10">
                            <button
                                onClick={() => setSelectedPartner(null)}
                                className="md:hidden w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 shadow-sm shadow-green-500/10">
                                    {selectedPartner.avatar_url ? (
                                        <img src={selectedPartner.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm">
                                            {(selectedPartner.full_name || 'K').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-900 text-sm truncate">{selectedPartner.full_name || 'Koç'}</h3>
                                <p className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Çevrimiçi
                                </p>
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
                                        <Send className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-700 mb-1">Sohbete Başla</h3>
                                    <p className="text-xs text-slate-500 font-medium max-w-[240px]">
                                        {selectedPartner.full_name} ile mesajlaşmaya başlayın
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {messages.map((msg, index) => {
                                        const isMe = msg.senderId === currentUser?.id;
                                        const showDate = index === 0 ||
                                            formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);

                                        const prevSame = index > 0 && messages[index - 1].senderId === msg.senderId;

                                        return (
                                            <div key={msg.id}>
                                                {showDate && (
                                                    <div className="flex justify-center my-3">
                                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-500 shadow-sm">
                                                            {formatDate(msg.timestamp)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "flex",
                                                    isMe ? "justify-end" : "justify-start",
                                                    !prevSame ? "mt-3" : "mt-0.5"
                                                )}>
                                                    <div className={cn(
                                                        "max-w-[75%] relative group",
                                                    )}>
                                                        <div className={cn(
                                                            "px-3 py-2 shadow-sm",
                                                            isMe
                                                                ? "bg-[#dcf8c6] text-slate-900 rounded-xl rounded-tr-sm"
                                                                : "bg-white text-slate-900 rounded-xl rounded-tl-sm",
                                                            !prevSame && isMe && "rounded-tr-xl",
                                                            !prevSame && !isMe && "rounded-tl-xl",
                                                        )}>
                                                            {/* Image if present */}
                                                            {msg.imageUrl && (
                                                                <img
                                                                    src={msg.imageUrl}
                                                                    alt="Paylaşılan fotoğraf"
                                                                    className="rounded-lg mb-1.5 max-w-full max-h-52 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => window.open(msg.imageUrl, '_blank')}
                                                                />
                                                            )}
                                                            <div className="flex items-end gap-2">
                                                                <p className="text-[13px] leading-relaxed font-medium break-words">{msg.content}</p>
                                                                <span className={cn(
                                                                    "text-[10px] font-medium shrink-0 flex items-center gap-0.5 translate-y-[1px]",
                                                                    isMe ? "text-slate-500" : "text-slate-400"
                                                                )}>
                                                                    {formatTime(msg.timestamp)}
                                                                    {isMe && (
                                                                        msg.read
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
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                                            newMessage.trim()
                                                ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20"
                                                : "bg-slate-200 text-slate-400"
                                        )}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between gap-3 px-2 py-1">
                                    <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                                        <Lock className="w-4 h-4 shrink-0" />
                                        <p>Bu koç ile sohbet etmek için aktif bir paketiniz olmalı.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                        onClick={() => router.push('/marketplace')}
                                    >
                                        Paket İncele
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Empty state (desktop only)
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-center px-8">
                        <div className="w-64 h-64 mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <MessageCircle className="w-20 h-20 text-green-300" />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-700 mb-2">Koçunla İletişime Geç</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed">
                            Sol taraftaki listeden bir koç seçerek sorularını sorabilir ve ilerlemeni paylaşabilirsin.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
