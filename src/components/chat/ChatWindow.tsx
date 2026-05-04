'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Loader2, MoreVertical, MessageSquare } from 'lucide-react';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatWindow({ projectId, conversationId }: { projectId: string; conversationId: string }) {
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, steps]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userContent = input;
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    setSteps(['Analyzing request...']);

    try {
      const response = await fetch(`/api/projects/${projectId}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userContent }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value);
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'step') {
              setSteps(prev => [...prev, data.step]);
            } else if (data.type === 'chunk') {
              setStreamingContent(prev => prev + data.chunk);
            } else if (data.type === 'user_message') {
              queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
            } else if (data.type === 'assistant_message') {
              queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
              setIsStreaming(false);
              setStreamingContent('');
              setSteps([]);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setSteps(['Error occurred. Please try again.']);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl" data-testid="chat-window">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Online</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth" data-testid="message-container">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                <div className={`flex space-x-3 max-w-[70%] ${i % 2 === 0 ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex-shrink-0" />
                  <div className="h-12 w-48 bg-white/5 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : messages?.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto" data-testid="empty-chat-state">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready to assist.</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Start a conversation to interact with your AI assistant and explore your project data.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages?.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg._id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${msg.role}`}
              >
                <div className={`flex space-x-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {isStreaming && (
              <div className="flex justify-start" data-testid="streaming-indicator">
                <div className="flex space-x-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl text-sm leading-relaxed bg-white/5 border border-white/10 text-white/90 rounded-tl-none space-y-3">
                    {streamingContent ? (
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                    ) : (
                      <div className="flex space-x-1.5 py-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <AnimatePresence>
                      {steps.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-white/5 space-y-1"
                          data-testid="ai-trace-steps"
                        >
                          {steps.map((step, idx) => (
                            <div key={idx} className={`text-[10px] font-mono flex items-center ${idx === steps.length - 1 ? 'text-blue-400' : 'text-white/20'}`}>
                              {idx === steps.length - 1 ? (
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              ) : (
                                <div className="w-1 h-1 bg-white/20 rounded-full mr-3 ml-1" />
                              )}
                              {step}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 bg-white/5 border-t border-white/5">
        <form onSubmit={handleSend} className="relative group" data-testid="chat-form">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all group-hover:border-white/20"
            disabled={isStreaming}
            data-testid="chat-input"
          />
          <button 
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
            data-testid="send-message-button"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
