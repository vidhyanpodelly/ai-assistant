import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getConversations, createConversation } from '@/services/chat.service';
import { ConversationSchema } from '@/lib/validations/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: projectId } = await params;
  const session = await getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const conversations = await getConversations(session.userId, projectId);
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: projectId } = await params;
  const session = await getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Zod validation for backend input
    const validated = ConversationSchema.partial().parse({
      ...body,
      projectId
    });

    const conversation = await createConversation(
      session.userId, 
      projectId, 
      validated.productInstanceId || 'default', 
      validated.title
    );
    
    return NextResponse.json(conversation);
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 403;
    return NextResponse.json({ error: error.message }, { status });
  }
}
