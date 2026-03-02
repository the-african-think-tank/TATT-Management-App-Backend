import { FormLabel } from "@/components/atoms/form-label";
import { SignupInput } from "@/components/atoms/signup-input";
import type { InputHTMLAttributes } from "react";

type SignupFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | undefined;
};

export function SignupField({
  id,
  label,
  placeholder = "",
  type = "text",
  error,
  ...props
}: SignupFieldProps) {
  return (
    <div className="space-y-1.5">
      <FormLabel htmlFor={id} className="font-medium leading-5">
        {label}
      </FormLabel>
      <SignupInput id={id} type={type} placeholder={placeholder} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
