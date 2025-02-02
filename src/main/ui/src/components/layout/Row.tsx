import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface RowProps {
  children?: ReactNode;
  className?: string;
  wrap?: boolean;
}

export default function Row({ children, className, wrap }: Readonly<RowProps>) {
  return (
    <div
      className={twMerge("flex flex-row", wrap === true ? "flex-wrap" : "flex-nowrap", className)}
    >
      {children}
    </div>
  );
}
