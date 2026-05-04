'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ChatWindow from '@/components/chat/ChatWindow';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { MessageSquare, Plus, ArrowLeft, ChevronRight, Zap, Bot, Sparkles, Trash2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: projectId } = React.use(params);
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data: config } = useDashboardConfig(projectId);

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ['conversations', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/conversations`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
  });

  const createConvMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productInstanceId: 'default',
          title: `New Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
        }),
      });
      if (!res.ok) throw new Error('Failed to create conversation');
      return res.json();
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
      setSelectedConversationId(newConv._id);
    },
  });

  const deleteConvMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${projectId}/conversations/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete conversation');
      return res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
      if (selectedConversationId === deletedId) {
        setSelectedConversationId(null);
      }
    },
  });

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden" data-testid="chat-layout">
      <div className="w-80 glass-sidebar flex flex-col z-20" data-testid="sidebar">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2 text-white/40 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient">Assistant</h2>
            <button 
              onClick={() => createConvMutation.mutate()}
              className="p-2 bg-white text-black rounded-xl hover:scale-110 active:scale-90 transition-all shadow-lg"
              data-testid="new-chat-button"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-white/5 border border-white/10 rounded-2xl mb-6">
             <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
               <ShieldCheck className="w-4 h-4 text-blue-400" />
             </div>
             <div className="min-w-0">
               <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Access Role</p>
               <p className="text-xs font-bold truncate">Project Admin</p>
             </div>
          </div>

          <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-white/20 uppercase font-bold">Tenant ID</span>
              <span className="text-[10px] font-mono text-white/40">{projectId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-white/20 uppercase font-bold">Project Context</span>
              <span className="text-[10px] font-mono text-blue-400/60">Isolated</span>
            </div>
          </div>

          {/* Config-driven Navigation */}
          <nav className="space-y-1 mb-8" data-testid="config-nav">
            {config?.navItems?.sort((a, b) => a.order - b.order).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2" data-testid="conversation-list">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : isError ? (
            <div className="p-4 text-center text-xs text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20">
              ⚠️ Connection failed. Please refresh.
            </div>
          ) : Array.isArray(conversations) ? (
            conversations.map((conv: any) => (
              <div key={conv._id} className="relative group" data-testid="conversation-item">
                <button
                  onClick={() => setSelectedConversationId(conv._id)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                    selectedConversationId === conv._id 
                      ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' 
                      : 'hover:bg-white/5 border border-transparent text-white/40 hover:text-white/80'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedConversationId === conv._id ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-bold truncate pr-6">{conv.title || 'Session'}</p>
                    <p className="text-[10px] uppercase tracking-wider opacity-60">Live</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedConversationId === conv._id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this session?')) {
                      deleteConvMutation.mutate(conv._id);
                    }
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-2 text-white/0 group-hover:text-red-400/60 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"
                  data-testid="delete-chat-button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-white/20">
              No active sessions
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Enterprise Access</p>
        </div>
      </div>

      <main className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-mesh">
        <AnimatePresence mode="wait">
          {selectedConversationId ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-5xl h-full z-10"
            >
              <ChatWindow projectId={projectId} conversationId={selectedConversationId} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8 z-10 max-w-lg"
            >
              <div className="w-20 h-20 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative">
                <Bot className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gradient">Hello.</h1>
                <p className="text-white/40 text-lg">
                  Select a session to begin. I can help with Shopify data, CRM analysis, and more.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
