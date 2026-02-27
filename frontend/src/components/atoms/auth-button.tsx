import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type AuthButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
>;

export function AuthButton({ children, className, type = "submit", ...props }: AuthButtonProps) {
  return (
    <button
      className={[
        "h-14 w-full rounded-lg bg-tatt-lime text-sm font-bold uppercase tracking-[0.7px] text-tatt-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tatt-lime",
        className ?? "",
      ].join(" ")}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
