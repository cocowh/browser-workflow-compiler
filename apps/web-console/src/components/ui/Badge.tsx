import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  icon?: ReactNode;
  label?: string;
};

export function Badge({ children, icon, label }: BadgeProps) {
  return (
    <div className="run-state" role="status" aria-label={label}>
      {icon}
      <span>{children}</span>
    </div>
  );
}
