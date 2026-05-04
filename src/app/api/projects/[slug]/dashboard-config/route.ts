import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDashboardConfig } from '@/services/dashboard.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: projectId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getDashboardConfig(session.userId, projectId);
    return NextResponse.json(config);
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 404;
    return NextResponse.json({ error: error.message }, { status });
  }
}
