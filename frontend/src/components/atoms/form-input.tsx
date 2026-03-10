import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIconSrc?: string | undefined;
  rightIconSrc?: string | undefined;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, leftIconSrc, rightIconSrc, leftIcon, rightIcon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const currentType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative flex h-[56px] items-center overflow-hidden rounded-lg bg-background px-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
        {leftIcon ? (
          <span className="mr-3 inline-flex w-5 shrink-0 items-center justify-center text-tatt-gray">
            {leftIcon}
          </span>
        ) : leftIconSrc ? (
          <span className="mr-3 inline-flex w-5 shrink-0 items-center justify-center">
            <img src={leftIconSrc} alt="" className="h-4 w-4 opacity-70" aria-hidden="true" />
          </span>
        ) : null}
        <input
          ref={ref}
          type={currentType}
          className={[
            "w-full bg-transparent text-sm text-tatt-black placeholder:text-tatt-gray focus:outline-none",
            className ?? "",
          ].join(" ")}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-3 inline-flex w-8 h-8 shrink-0 items-center justify-center focus:outline-none hover:bg-gray-100/50 rounded-full transition-colors text-tatt-gray"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : rightIcon || rightIconSrc ? (
          <span className="ml-3 inline-flex w-5 items-center justify-center text-tatt-gray">
            {rightIcon ? rightIcon : <img src={rightIconSrc} alt="" className="h-3.5 w-5 opacity-70" aria-hidden="true" />}
          </span>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

