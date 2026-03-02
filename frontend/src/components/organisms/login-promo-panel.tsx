const BRAND_PHOTO_SRC =
  "https://www.figma.com/api/mcp/asset/91c32336-6bf8-4247-acef-615677c35381";
const LOGO_ICON_SRC = "/assets/tattlogoIcon.svg";

export function LoginPromoPanel() {
  return (
    <aside className="relative hidden h-full flex-1 overflow-hidden bg-[#181811] lg:block">
      <img
        src={BRAND_PHOTO_SRC}
        alt="African Think Tank community members"
        className="absolute inset-0 h-full w-full object-cover object-[30%_50%] opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#181811]/80 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-10 sm:p-12 xl:p-16">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-lg">
              <img src={LOGO_ICON_SRC} alt="The African Think Tank logo" className="h-8 w-8" />
            </span>
            <p className="text-2xl font-bold tracking-[-0.6px] text-white">
              The African Think Tank
            </p>
          </div>

          <h2 className="max-w-[491px] text-5xl font-black leading-[1.1] text-white">
            Empowering Leaders across the Diaspora.
          </h2>
          <p className="mt-6 max-w-[448px] text-lg leading-[1.625] text-white/80">
            Join a global network of innovators and intellectuals dedicated to
            advancing the African continent and its people through collaborative
            excellence.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="h-1 w-12 rounded-full bg-tatt-lime" />
          <span className="h-1 w-4 rounded-full bg-white/30" />
          <span className="h-1 w-4 rounded-full bg-white/30" />
        </div>
      </div>
    </aside>
  );
}
