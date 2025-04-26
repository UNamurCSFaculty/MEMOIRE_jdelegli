import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ColProps {
  children?: ReactNode;
  className?: string;
  wrap?: boolean;
}

export default function Col({ children, className, wrap }: Readonly<ColProps>) {
  return (
    <div
      className={twMerge("flex flex-col", wrap === true ? "flex-wrap" : "flex-nowrap", className)}
    >
      {children}
    </div>
  );
}
