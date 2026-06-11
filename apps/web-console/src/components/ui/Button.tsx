import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  label?: string;
  variant?: "primary" | "icon";
};

export function Button({ children, icon, label, variant = "primary" }: ButtonProps) {
  if (variant === "icon") {
    return (
      <button className="icon-button" type="button" aria-label={label} title={label}>
        {icon}
        <span className="visually-hidden">{children}</span>
      </button>
    );
  }

  return (
    <button className="primary-action" type="button">
      {icon}
      <span>{children}</span>
    </button>
  );
}
