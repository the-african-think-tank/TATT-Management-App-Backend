const BRAND_PHOTO_SRC = "/assets/signup_brand_diaspora.webp";
const LOGO_SRC = "/assets/tattlogoIcon.svg";

export function SignupBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#181811] p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
      <div className="absolute inset-0">
        <img
          src={BRAND_PHOTO_SRC}
          alt="Professionals collaborating"
          className="h-full w-full object-cover object-[35%_50%] opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181811]/85 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <img src={LOGO_SRC} alt="The African Think Tank" className="h-10 w-10" />
        <p className="text-[32px] font-bold leading-7 tracking-[-0.5px] text-white">
          The African Think Tank
        </p>
      </div>

      <div className="relative z-10 max-w-[512px]">
        <h2 className="text-6xl font-extrabold leading-[1.15] text-white">
          Empowering the
          <br />
          <span className="text-tatt-lime">African Diaspora</span>
          <br />
          through unity.
        </h2>
        <p className="mt-6 text-lg font-light leading-[1.625] text-white/70">
          Join a global network of thinkers, creators, and entrepreneurs
          dedicated to sustainable growth and community development.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-8">
          <div>
            <p className="text-4xl font-bold text-tatt-lime">15k+</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[1.2px] text-white/50">
              Active Members
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold text-tatt-lime">42</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[1.2px] text-white/50">
              Global Chapters
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold text-tatt-lime">120+</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[1.2px] text-white/50">
              Business Ventures
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
