import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProjectBySlug } from '@/services/project.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const project = await getProjectBySlug(session.userId, slug);
    return NextResponse.json(project);
  } catch (error: any) {
    const status = error.message === 'Forbidden' ? 403 : 404;
    return NextResponse.json({ error: error.message }, { status });
  }
}
