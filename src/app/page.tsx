import { getSession } from '@/lib/auth';
import dbConnect from '@/db/mongoose';
import { User } from '@/db/models';
import { getUserProjects } from '@/lib/access';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, LogOut, ChevronRight, Zap } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mesh p-8 text-center">
        <div className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
          <Zap className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gradient mb-4">Workspace Locked</h1>
        <p className="text-white/40 mb-8 max-w-sm">Please sign in to access your projects and administration dashboard.</p>
        <Link href="/login" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-white/10">
          Go to Login
        </Link>
      </div>
    );
  }

  await dbConnect();
  const user = await User.findById(session.userId);
  const projects = await getUserProjects(session.userId);

  return (
    <div className="min-h-screen bg-mesh text-white p-8 md:p-12 lg:p-24 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              <span className="text-white">Welcome back, </span>
              <span className="text-blue-400">{user?.name}</span>
            </h1>
            <p className="text-white/40 text-lg">Select a project to begin your session.</p>
          </div>
          <form action={logout}>
            <button className="flex items-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
              <LogOut className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div 
              key={project.projectId} 
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-all hover:translate-y-[-4px] shadow-2xl shadow-black/40"
            >
              <div className="absolute top-6 right-6 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40">
                {project.role}
              </div>
              
              <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-blue-400" />
              </div>

              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{project.name}</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">Active instance: AI-Assistant v2.0</p>

              <div className="flex flex-col gap-3">
                <Link 
                  href={`/projects/${project.projectId}/chat`}
                  className="flex items-center justify-between w-full p-4 bg-white text-black rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Assistant</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {project.role === 'admin' && (
                  <Link 
                    href={`/projects/${project.projectId}/admin`}
                    className="flex items-center justify-center w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all text-white/80"
                  >
                    Manage Console
                  </Link>
                )}
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-24 text-center glass-card rounded-3xl">
              <p className="text-white/20 text-lg italic">No project memberships assigned to your account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
