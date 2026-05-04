import dbConnect from '@/db/mongoose';
import { Conversation, Message, ProductInstance } from '@/db/models';
import { canAccessProject } from '@/lib/access';
import { getIntegrationContext } from './integration.service';
import { generateAssistantStreamingResponse } from './ai.service';

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
  const conversation = await Conversation.findOne({ _id: conversationId, projectId });
  if (!conversation) throw new Error('Conversation not found in this project');
  return Message.find({ conversationId }).sort({ createdAt: 1 });
}

export async function handleStreamingChat(userId: string, projectId: string, conversationId: string, content: string, onUpdate: (data: any) => void) {
  await dbConnect();
  const authorized = await canAccessProject(userId, projectId);
  if (!authorized) throw new Error('Forbidden');

  const conversation = await Conversation.findOne({ _id: conversationId, projectId });
  if (!conversation) throw new Error('Conversation not found');

  // 1. Save user message
  const userMsg = await Message.create({
    conversationId,
    role: 'user',
    content,
  });
  onUpdate({ type: 'user_message', message: userMsg });

  try {
    // 2. Integration fetch
    onUpdate({ type: 'step', step: 'Fetching integration data...' });
    const { context, steps } = await getIntegrationContext(projectId, conversation.productInstanceId.toString());
    
    // 3. AI Stream
    onUpdate({ type: 'step', step: 'Generating response...' });
    let fullResponse = "";
    
    await generateAssistantStreamingResponse(content, context, (chunk) => {
      fullResponse += chunk;
      onUpdate({ type: 'chunk', chunk });
    });

    // 4. Save assistant message
    const assistantMsg = await Message.create({
      conversationId,
      role: 'assistant',
      content: fullResponse || "AI temporarily unavailable. Please try again.",
    });
    
    onUpdate({ type: 'assistant_message', message: assistantMsg });
  } catch (error: any) {
    console.error('Chat streaming error details:', {
      message: error.message,
      stack: error.stack,
      projectId,
      conversationId
    });
    onUpdate({ type: 'error', error: `AI Error: ${error.message}` });
  }
}

export async function createConversation(userId: string, projectId: string, productInstanceId: string, title?: string) {
  await dbConnect();
  const authorized = await canAccessProject(userId, projectId);
  if (!authorized) throw new Error('Forbidden');

  let actualInstanceId = productInstanceId;

  // If "default" is passed, try to find an existing instance or create a dummy one
  if (productInstanceId === 'default') {
    let instance = await ProductInstance.findOne({ projectId });
    if (!instance) {
      // Create a default instance so conversation creation doesn't fail due to ref integrity
      instance = await ProductInstance.create({
        projectId,
        productType: 'general',
        activeIntegrations: ['shopify', 'crm'] // Default integrations for demo
      });
    }
    actualInstanceId = instance._id;
  }

  return Conversation.create({
    projectId,
    productInstanceId: actualInstanceId,
    title: title || 'New Conversation',
  });
}

export async function deleteConversation(userId: string, projectId: string, conversationId: string) {
  await dbConnect();
  const authorized = await canAccessProject(userId, projectId);
  if (!authorized) throw new Error('Forbidden');

  const conversation = await Conversation.findOne({ _id: conversationId, projectId });
  if (!conversation) throw new Error('Conversation not found');

  // Delete all messages in the conversation
  await Message.deleteMany({ conversationId });
  
  // Delete the conversation itself
  await Conversation.deleteOne({ _id: conversationId });
  
  return { success: true };
}
