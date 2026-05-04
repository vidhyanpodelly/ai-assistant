import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteConversation } from '@/services/chat.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; conversationId: string }> }
) {
  const { slug: projectId, conversationId } = await params;
  const session = await getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await deleteConversation(session.userId, projectId, conversationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === 'Forbidden' ? 403 : 404;
    return NextResponse.json({ error: error.message }, { status });
  }
}
