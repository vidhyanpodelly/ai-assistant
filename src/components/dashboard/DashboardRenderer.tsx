import React from 'react';
import { DashboardConfig } from '@/lib/validations/schemas';
import { WIDGET_COMPONENTS, FallbackWidget } from './WidgetRegistry';

export default function DashboardRenderer({ config }: { config: DashboardConfig }) {
  return (
    <div className="space-y-24 pb-24">
      {config.sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-12">
          <div className="flex items-center space-x-6">
            <h2 className="text-2xl font-bold tracking-tight text-white/90">{section.title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {section.widgets
              .sort((a, b) => a.order - b.order)
              .map((widget, wIdx) => {
                const Component = WIDGET_COMPONENTS[widget.type] || FallbackWidget;
                return (
                  <div key={wIdx} className="h-full">
                    <Component {...widget} />
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
