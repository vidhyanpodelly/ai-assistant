import dbConnect from '@/db/mongoose';
import { DashboardConfig } from '@/db/models';
import { isAdmin } from '@/lib/access';

export async function getDashboardConfig(userId: string, projectId: string) {
  await dbConnect();

  const authorized = await isAdmin(userId, projectId);
  if (!authorized) throw new Error('Forbidden: Admin access required');

  const config = await DashboardConfig.findOne({ projectId });
  if (!config) throw new Error('Dashboard config not found');

  return config;
}
