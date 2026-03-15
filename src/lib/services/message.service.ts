/**
 * Message Service — Mesajlaşma
 */

import { getSupabase } from '../supabase';
import { toCamels } from './supabase-helpers';
import type { Message, Conversation } from '../types';
import type { Profile } from '@/types/database';
import { purchaseService } from './purchase.service';

function mapMessage(m: any): Message {
    return {
        ...m,
        timestamp: m.createdAt,
        read: m.isRead !== undefined ? m.isRead : m.read,
    };
}

export const messageService = {
    async getMessages(userId: string, partnerId: string): Promise<Message[]> {
        const { data } = await (getSupabase() as any)
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
            )
            .order('created_at', { ascending: true });

        return toCamels(data || []).map(mapMessage);
    },

    async markMessagesAsRead(userId: string, senderId: string) {
        await (getSupabase() as any)
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', userId)
            .eq('sender_id', senderId);
        return true;
    },

    async getConversations(userId: string): Promise<Conversation[]> {
        const sb = getSupabase() as any;

        const { data: userProfile } = await sb
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        const role = userProfile?.role;

        const { data: messages } = await sb
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        const camelMessages = toCamels(messages || []).map(mapMessage) as Message[];

        const partnerIds = new Set<string>();
        const lastMessages = new Map<string, Message>();
        const unreadCounts = new Map<string, number>();

        camelMessages.forEach((msg) => {
            const isSender = msg.senderId === userId;
            const partnerId = isSender ? msg.receiverId : msg.senderId;

            if (!partnerIds.has(partnerId)) {
                partnerIds.add(partnerId);
                lastMessages.set(partnerId, msg);
            }

            if (!isSender && !msg.read) {
                unreadCounts.set(partnerId, (unreadCounts.get(partnerId) || 0) + 1);
            }
        });

        const activePartners = new Set<string>();

        try {
            if (role === 'coach') {
                const students = await purchaseService.getCoachStudents(userId);
                students.forEach((s) => {
                    activePartners.add(s.id);
                    partnerIds.add(s.id);
                });
            } else if (role === 'student') {
                const purchases = await purchaseService.getPurchases(userId);
                purchases.forEach((p: any) => {
                    const hasSharedChat =
                        p.packageSnapshot?.has_chat_support === true ||
                        p.packageSnapshot?.hasChatSupport === true;
                    if (p.coachId && p.status === 'active' && hasSharedChat) {
                        activePartners.add(p.coachId);
                        partnerIds.add(p.coachId);
                    }
                });
            }
        } catch (e) {
            console.warn('Could not fetch active partners:', e);
        }

        if (partnerIds.size === 0) return [];

        const { data: profiles } = await sb
            .from('profiles')
            .select('*')
            .in('id', Array.from(partnerIds));

        if (!profiles) return [];

        const camelProfiles = toCamels(profiles) as Profile[];

        return camelProfiles
            .filter((p) => lastMessages.has(p.id) || activePartners.has(p.id))
            .map((partner) => {
                const lastMsg = lastMessages.get(partner.id);
                return {
                    partner,
                    lastMessage: lastMsg || null,
                    unreadCount: unreadCounts.get(partner.id) || 0,
                } as unknown as Conversation;
            })
            .sort((a, b) => {
                const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                return timeB - timeA;
            });
    },

    async sendMessage(senderId: string, receiverId: string, content: string, imageUrl?: string) {
        const { data, error } = await (getSupabase() as any)
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content,
                image_url: imageUrl,
            })
            .select()
            .single();

        if (error) throw error;
        return mapMessage(toCamels(data));
    },

    subscribeToMessages(callback: (payload: any) => void) {
        return getSupabase()
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, callback)
            .subscribe();
    },
};
