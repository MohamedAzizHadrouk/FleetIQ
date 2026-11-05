import type { ReactNode } from 'react';

interface OnboardingLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function OnboardingLayout({
  title,
  subtitle,
  children,
  footer,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-10">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.25) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.25) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-4">
            FleetIQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer && (
          <div className="mt-8 flex justify-center">{footer}</div>
        )}
      </div>
    </div>
  );
}
