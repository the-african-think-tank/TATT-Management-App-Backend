import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type SignupInputProps = InputHTMLAttributes<HTMLInputElement>;

export const SignupInput = forwardRef<HTMLInputElement, SignupInputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const currentType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          type={currentType}
          className={[
            "h-[42px] w-full rounded-lg border border-border bg-surface px-4 text-sm text-tatt-black placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime/30",
            className ?? "",
            isPassword ? "pr-10" : "" // add right padding if password toggle exists
          ].join(" ")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full text-tatt-gray hover:bg-gray-100/50 focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);

SignupInput.displayName = "SignupInput";
