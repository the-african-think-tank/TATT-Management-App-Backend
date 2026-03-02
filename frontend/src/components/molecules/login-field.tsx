import { FormInput } from "@/components/atoms/form-input";
import { FormLabel } from "@/components/atoms/form-label";
import type { InputHTMLAttributes } from "react";

type LoginFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  leftIconSrc?: string;
  rightIconSrc?: string;
  error?: string | undefined;
};

export function LoginField({
  id,
  label,
  placeholder,
  type = "text",
  leftIconSrc,
  rightIconSrc,
  error,
  ...props
}: LoginFieldProps) {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormInput
        id={id}
        placeholder={placeholder}
        type={type}
        leftIconSrc={leftIconSrc}
        rightIconSrc={rightIconSrc}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
