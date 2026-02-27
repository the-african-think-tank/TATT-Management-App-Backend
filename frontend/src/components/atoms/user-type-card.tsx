import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from "react";

type UserTypeCardProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    selected?: boolean;
    icon: ReactNode;
  }
>;

export function UserTypeCard({
  selected = false,
  icon,
  children,
  className,
  ...props
}: UserTypeCardProps) {
  return (
    <button
      type="button"
      className={[
        "flex h-[72px] w-full flex-col items-center justify-center gap-2 rounded-lg border text-[10px] font-bold uppercase tracking-[-0.5px] text-tatt-black transition",
        selected
          ? "border-tatt-lime bg-tatt-lime/5"
          : "border-border bg-surface hover:bg-[#fafaf8]",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      <div className={selected ? "text-tatt-lime" : "text-tatt-gray"}>
        {icon}
      </div>
      <span>{children}</span>
    </button>
  );
}
