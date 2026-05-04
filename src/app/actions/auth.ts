'use server';

import { setSession, logout as clearSession } from '@/lib/auth';
import dbConnect from '@/db/mongoose';
import { User, Membership } from '@/db/models';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  await dbConnect();
  
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return { error: 'Invalid email' };
  }

  // Check if user has the requested role in at least one project
  const membership = await Membership.findOne({ userId: user._id, role });
  if (!membership) {
    return { error: `User is not a ${role} in any project` };
  }

  await setSession(user._id.toString());
  redirect('/');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}
