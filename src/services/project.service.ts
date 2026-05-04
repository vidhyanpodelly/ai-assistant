import dbConnect from '@/db/mongoose';
import { Project } from '@/db/models';
import { canAccessProject } from '@/lib/access';

export async function getProjectBySlug(userId: string, slug: string) {
  await dbConnect();
  
  const project = await Project.findOne({ slug });
  if (!project) throw new Error('Project not found');

  const hasAccess = await canAccessProject(userId, project._id.toString());
  if (!hasAccess) throw new Error('Forbidden');

  return project;
}

export async function getProjectById(userId: string, projectId: string) {
  await dbConnect();

  const hasAccess = await canAccessProject(userId, projectId);
  if (!hasAccess) throw new Error('Forbidden');

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  return project;
}
