import { useId } from 'react';

/**
 * FleetIQ AI assistant mark: a soft chat bubble holding a small spark.
 * - `tile`: filled squircle in the design-system blues (launcher, panel header)
 * - `glyph`: single-colour line version using currentColor (message avatars)
 */
export function AssistantIcon({
  size = 24,
  variant = 'glyph',
  className,
  title,
}: {
  size?: number;
  variant?: 'tile' | 'glyph';
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const a11y = title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const };

  if (variant === 'glyph') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...a11y}>
        <path
          d="M12 3.5c4.7 0 8.5 3.1 8.5 7.1 0 4-3.8 7.1-8.5 7.1-.9 0-1.8-.1-2.6-.3L5.6 19.6c-.5.3-1.1-.1-1-.7l.5-3.1C3.9 14.5 3.5 12.6 3.5 10.6c0-4 3.8-7.1 8.5-7.1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.2c.25 1.55 1.05 2.35 2.6 2.6-1.55.25-2.35 1.05-2.6 2.6-.25-1.55-1.05-2.35-2.6-2.6 1.55-.25 2.35-1.05 2.6-2.6Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className={className} {...a11y}>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="8" y1="4" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4F86FF" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id={`${uid}-hl`} x1="28" y1="0" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="56" height="56" rx="17" fill={`url(#${uid}-bg)`} />
      <rect x="0" y="0" width="56" height="56" rx="17" fill={`url(#${uid}-hl)`} />
      <rect x=".75" y=".75" width="54.5" height="54.5" rx="16.25" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1.5" />
      {/* bubble */}
      <path
        d="M28 13.5c8.3 0 15 5.5 15 12.4 0 6.9-6.7 12.4-15 12.4-1.6 0-3.1-.2-4.6-.6l-6.5 3.8c-.8.5-1.8-.2-1.6-1.1l.9-5.2C14.3 32.9 13 29.6 13 25.9c0-6.9 6.7-12.4 15-12.4Z"
        fill="#fff"
      />
      {/* spark */}
      <path
        d="M28 18.6c.45 2.75 1.85 4.15 4.6 4.6-2.75.45-4.15 1.85-4.6 4.6-.45-2.75-1.85-4.15-4.6-4.6 2.75-.45 4.15-1.85 4.6-4.6Z"
        fill="#2F6BFF"
      />
      <circle cx="34.6" cy="29.6" r="1.6" fill="#2F6BFF" fillOpacity=".55" />
    </svg>
  );
}
