import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMessages, handleStreamingChat } from '@/services/chat.service';
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
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Zod validation for message content
    const validated = MessageSchema.pick({ content: true }).parse(body);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Immediate heartbeat to keep Vercel connection alive
        sendUpdate({ type: 'step', step: 'Initializing session...' });

        try {
          await handleStreamingChat(
            session.userId,
            projectId,
            conversationId,
            validated.content,
            sendUpdate
          );
          controller.close();
        } catch (error: any) {
          sendUpdate({ type: 'error', error: error.message });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 403;
    return new Response(JSON.stringify({ error: error.message }), { status });
  }
}
