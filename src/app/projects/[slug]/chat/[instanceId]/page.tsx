'use client';

import React, { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage({ params }: { params: Promise<{ slug: string; instanceId: string }> }) {
  const { slug: projectId, instanceId } = React.use(params);
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);

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
        body: JSON.stringify({ productInstanceId: instanceId, title: 'New Chat' }),
      });
      if (!res.ok) throw new Error('Failed to create conversation');
      return res.json();
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
      setSelectedConversationId(newConv._id);
    },
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-4">Project Assistant</h2>
          <button 
            onClick={() => createConvMutation.mutate()}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
             <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
          ) : isError ? (
            <div className="p-4 text-center text-xs text-red-500">Error loading chats</div>
          ) : Array.isArray(conversations) ? (
            conversations.map((conv: any) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConversationId(conv._id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  selectedConversationId === conv._id ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                {conv.title || 'Untitled Chat'}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">No chats found</div>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        {selectedConversationId ? (
          <div className="w-full max-w-4xl">
            <ChatWindow projectId={projectId} conversationId={selectedConversationId} />
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            <p className="text-xl font-medium mb-2">Welcome</p>
            <p className="text-sm">Select a conversation or start a new one to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
