import { forwardRef, type InputHTMLAttributes } from "react";

type SignupInputProps = InputHTMLAttributes<HTMLInputElement>;

export const SignupInput = forwardRef<HTMLInputElement, SignupInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "h-[42px] w-full rounded-lg border border-border bg-surface px-4 text-sm text-tatt-black placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime/30",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    );
  }
);

SignupInput.displayName = "SignupInput";
