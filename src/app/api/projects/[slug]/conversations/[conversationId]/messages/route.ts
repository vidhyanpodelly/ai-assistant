import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMessages, handleChat } from '@/services/chat.service';
import { MessageSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set to 60s for Pro, or best effort on Hobby

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string, conversationId: string }> }
) {
  const { slug: projectId, conversationId } = await params;
  const session = await getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const messages = await getMessages(session.userId, projectId, conversationId);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string, conversationId: string }> }
) {
  const { slug: projectId, conversationId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Zod validation for message content
    const validated = MessageSchema.pick({ content: true }).parse(body);

    const result = await handleChat(
      session.userId,
      projectId,
      conversationId,
      validated.content
    );

    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 403;
    return NextResponse.json({ error: error.message }, { status });
  }
}
