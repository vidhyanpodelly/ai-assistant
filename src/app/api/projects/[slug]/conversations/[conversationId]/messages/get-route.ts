import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMessages } from '@/services/chat.service';

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
