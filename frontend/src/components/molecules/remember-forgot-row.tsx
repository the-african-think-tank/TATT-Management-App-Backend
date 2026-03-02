export function RememberForgotRow() {
  return (
    <div className="flex items-center justify-between">
      <label className="inline-flex items-center gap-3 text-sm text-tatt-gray">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-[4px] border border-border bg-background accent-tatt-lime"
        />
        Remember me
      </label>
      <a href="#" className="text-sm font-semibold leading-6 text-tatt-black hover:underline">
        Forgot password?
      </a>
    </div>
  );
}
