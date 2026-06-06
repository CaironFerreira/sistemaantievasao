import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-rose-200 bg-rose-50 text-rose-950",
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
};

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn("rounded-2xl border px-4 py-3 text-sm", variants[variant], className)}
      {...props}
    />
  );
}
