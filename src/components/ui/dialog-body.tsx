import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flush';
}

export function DialogBody({
  variant = 'default',
  className,
  ...props
}: DialogBodyProps) {
  return (
    <div
      className={cn(
        variant === 'default' && 'p-6',
        variant === 'flush' && 'p-0',
        className
      )}
      {...props}
    />
  );
}
