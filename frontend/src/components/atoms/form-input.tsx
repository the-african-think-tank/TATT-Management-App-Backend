import { forwardRef, type InputHTMLAttributes } from "react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIconSrc?: string | undefined;
  rightIconSrc?: string | undefined;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, leftIconSrc, rightIconSrc, ...props }, ref) => {
    return (
      <div className="relative flex h-[56px] items-center overflow-hidden rounded-lg bg-background px-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
        {leftIconSrc ? (
          <span className="mr-3 inline-flex w-5 shrink-0 items-center justify-center">
            <img src={leftIconSrc} alt="" className="h-4 w-4 opacity-70" aria-hidden="true" />
          </span>
        ) : null}
        <input
          ref={ref}
          className={[
            "w-full bg-transparent text-sm text-tatt-black placeholder:text-tatt-gray focus:outline-none",
            className ?? "",
          ].join(" ")}
          {...props}
        />
        {rightIconSrc ? (
          <span className="ml-3 inline-flex w-5 shrink-0 items-center justify-center">
            <img src={rightIconSrc} alt="" className="h-3.5 w-5 opacity-70" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
