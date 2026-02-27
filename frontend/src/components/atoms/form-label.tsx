import type { LabelHTMLAttributes, PropsWithChildren } from "react";

type FormLabelProps = PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>;

export function FormLabel({ children, className, ...props }: FormLabelProps) {
  return (
    <label
      className={[
        "block text-sm font-semibold leading-6 text-[#181811]",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
    </label>
  );
}
