import dbConnect from '@/db/mongoose';
import { Conversation, Message } from '@/db/models';
import { canAccessProject } from '@/lib/access';
import { generateAssistantResponse } from './ai.service';

export async function getConversations(userId: string, projectId: string) {
  await dbConnect();
  const authorized = await canAccessProject(userId, projectId);
  if (!authorized) throw new Error('Forbidden');
  return Conversation.find({ projectId }).sort({ updatedAt: -1 });
}

export async function getMessages(userId: string, projectId: string, conversationId: string) {
  await dbConnect();
  const authorized = await canAccessProject(userId, projectId);
  if (!authorized) throw new Error('Forbidden');

  return Message.find({ conversationId }).sort({ createdAt: 1 });
}

// 🔥🔥🔥 THIS IS THE FIXED FUNCTION
export async function handleChat(
  userId: string,
  projectId: string,
  conversationId: string,
  content: string
) {
  await dbConnect();

  // 1. AUTH CHECK
  const authorized = await canAccessProject(userId, projectId);
  if (!authorized) throw new Error('Forbidden');

  // 2. SAVE USER MESSAGE FIRST (NO PARALLEL)
  const userMsg = await Message.create({
    conversationId,
    role: 'user',
    content
  });

  let aiReply = '';

  try {
    // 🔥 REMOVE INTEGRATION DEPENDENCY (THIS WAS BREAKING PROD)
    aiReply = await generateAssistantResponse(content, "");

    if (!aiReply) {
      throw new Error("Empty AI response");
    }

  } catch (err) {
    console.error("AI FAILED:", err);

    aiReply = "⚠️ AI temporarily unavailable";
  }

  // 3. ALWAYS SAVE ASSISTANT MESSAGE (NO MATTER WHAT)
  const assistantMsg = await Message.create({
    conversationId,
    role: 'assistant',
    content: aiReply
  });

  return {
    userMessage: userMsg,
    assistantMessage: assistantMsg
  };
}