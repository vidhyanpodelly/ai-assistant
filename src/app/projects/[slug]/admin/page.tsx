'use client';

import React from 'react';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import { LayoutDashboard, RefreshCcw, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: projectId } = React.use(params);
  const { data: config, isLoading, error, refetch, isFetching } = useDashboardConfig(projectId);
  const [lastSync, setLastSync] = React.useState<string>(new Date().toLocaleTimeString());

  React.useEffect(() => {
    if (!isFetching && config) {
      setLastSync(new Date().toLocaleTimeString());
    }
  }, [isFetching, config]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] p-8 md:p-12 lg:p-24 space-y-12">
        <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-[2rem] animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-8 text-center">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-red-500/10">
          <ShieldCheck className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">403 - Access Denied</h1>
        <p className="text-white/40 mb-10 max-w-sm text-lg leading-relaxed">
          Security policy prevents non-admin users from accessing this tenant's configuration.
        </p>
        <div className="flex flex-col space-y-4">
          <Link href="/" className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
            Return to Secure Hub
          </Link>
          <span className="text-[10px] text-white/10 uppercase tracking-[0.3em] font-bold">Protocol Enforced</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-mesh text-white p-8 md:p-12 lg:p-24 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white/40 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                <LayoutDashboard className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gradient">Admin Console</h1>
                <div className="flex items-center space-x-3 mt-1">
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    Role: Admin
                  </p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                    Config-driven (MongoDB)
                  </p>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                    Schema Validated (Zod)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Organization</span>
              <span className="text-sm font-bold text-white/60">Managed Tenant: {projectId.slice(-6).toUpperCase()}</span>
            </div>
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center space-x-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group disabled:opacity-50"
            >
              <RefreshCcw className={`w-5 h-5 text-white/60 group-hover:text-blue-400 transition-colors ${isFetching ? 'animate-spin text-blue-400' : ''}`} />
              <span className="text-sm font-bold">Sync Config</span>
            </button>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 p-4 bg-white/5 border border-white/10 rounded-3xl"
        >
          <div className="flex flex-col px-4 border-r border-white/5">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Config Source</span>
            <span className="text-xs font-bold text-blue-400">MongoDB Clusters</span>
          </div>
          <div className="flex flex-col px-4 border-r border-white/5">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Last Synchronized</span>
            <span className="text-xs font-bold text-white/60">{lastSync}</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Active Widgets</span>
            <span className="text-xs font-bold text-white/60">
              {config.sections.reduce((acc, s) => acc + s.widgets.length, 0)} Components
            </span>
          </div>
        </motion.div>

        <motion.div
          key={`${lastSync}-${isFetching}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={isFetching ? 'animate-pulse' : ''}
        >
          <DashboardRenderer config={config} />
        </motion.div>
      </div>
    </div>
  );
}
