import type { InputHTMLAttributes } from "react";

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-4 w-4 rounded border border-input text-primary focus:ring-ring"
      type="checkbox"
      {...props}
    />
  );
}
