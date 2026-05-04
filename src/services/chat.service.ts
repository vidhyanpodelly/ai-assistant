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

  // 1. Fetch conversation and check authorization in parallel
  onUpdate({ type: 'step', step: 'Verifying permissions...' });
  const [authorized, conversation] = await Promise.all([
    canAccessProject(userId, projectId),
    Conversation.findOne({ _id: conversationId, projectId })
  ]);

  if (!authorized) throw new Error('Forbidden');
  if (!conversation) throw new Error('Conversation not found');

  // 2. Parallelize message saving and integration fetch
  onUpdate({ type: 'step', step: 'Fetching integration context...' });
  
  const [userMsg, integration] = await Promise.all([
    Message.create({ conversationId, role: 'user', content }),
    getIntegrationContext(projectId, conversation.productInstanceId.toString())
  ]);

  onUpdate({ type: 'user_message', message: userMsg });

  try {
    const { context } = integration;
    
    // 3. AI Stream with first-token detection
    onUpdate({ type: 'step', step: 'Connecting to AI engine...' });
    let fullResponse = "";
    let firstTokenReceived = false;
    
    await generateAssistantStreamingResponse(content, context, (chunk) => {
      if (!firstTokenReceived) {
        onUpdate({ type: 'step', step: 'Generating response...' });
        firstTokenReceived = true;
      }
      fullResponse += chunk;
      onUpdate({ type: 'chunk', chunk });
    });

    // 5. Finalize assistant message
    if (!fullResponse) {
      throw new Error("AI returned empty response");
    }

    const assistantMsg = await Message.create({
      conversationId,
      role: 'assistant',
      content: fullResponse,
    });
    
    onUpdate({ type: 'assistant_message', message: assistantMsg });
  } catch (error: any) {
    console.error('Chat streaming error details:', {
      message: error.message,
      stack: error.stack,
      projectId,
      conversationId
    });
    onUpdate({ type: 'error', error: `AI temporarily unavailable` });
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
