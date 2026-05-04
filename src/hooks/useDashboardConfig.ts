'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardConfigSchema, DashboardConfig } from '@/lib/validations/schemas';

export function useDashboardConfig(projectId: string) {
  return useQuery({
    queryKey: ['dashboard-config', projectId],
    queryFn: async (): Promise<DashboardConfig> => {
      const res = await fetch(`/api/projects/${projectId}/dashboard-config`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch dashboard config');
      }
      const data = await res.json();
      
      // Zod validation before returning to components
      return DashboardConfigSchema.parse(data) as DashboardConfig;
    },
    enabled: !!projectId,
  });
}
