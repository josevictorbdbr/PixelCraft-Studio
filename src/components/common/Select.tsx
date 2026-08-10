import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly SelectOption[];
}

export function Select({ options, className = "", ...rest }: SelectProps) {
  return (
    <select
      className={`w-full h-[34px] px-3 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent cursor-pointer ${className}`}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
