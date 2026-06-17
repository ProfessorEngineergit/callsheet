import { type ReactNode } from 'react';

export function PageHeader({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-border bg-bg/95 px-4 backdrop-blur">
      {icon && <span className="text-text-secondary">{icon}</span>}
      <h1 className="text-[14px] font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}
