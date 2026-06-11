import type { ReactNode } from "react";

type PanelHeaderProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
};

export function PanelHeader({ eyebrow, title, action }: PanelHeaderProps) {
  return (
    <div className="panel-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
