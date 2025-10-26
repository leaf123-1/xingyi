"use client";

import { useId } from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onCheckedChange }: CheckboxProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="h-4 w-4 rounded border border-input accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}
