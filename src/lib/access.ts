import dbConnect from '@/db/mongoose';
import { Membership } from '@/db/models';

export async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
  await dbConnect();
  const membership = await Membership.findOne({ userId, projectId });
  return !!membership;
}

export async function isAdmin(userId: string, projectId: string): Promise<boolean> {
  await dbConnect();
  const membership = await Membership.findOne({ userId, projectId, role: 'admin' });
  return !!membership;
}

export async function getProjectRole(userId: string, projectId: string): Promise<'admin' | 'member' | null> {
  await dbConnect();
  const membership = await Membership.findOne({ userId, projectId });
  return membership?.role as 'admin' | 'member' || null;
}

export async function getUserProjects(userId: string) {
  await dbConnect();
  const memberships = await Membership.find({ userId }).populate('projectId');
  return memberships.map((m: any) => ({
    projectId: m.projectId._id.toString(),
    name: m.projectId.name,
    slug: m.projectId.slug,
    role: m.role
  }));
}
