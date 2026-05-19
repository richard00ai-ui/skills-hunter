import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left: brand */}
      <section className="hidden md:flex flex-1 relative overflow-hidden bg-surface-container p-16 flex-col justify-between">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-display-sm font-display font-black text-primary tracking-tighter mb-2">
            Skills Hunter
          </h1>
          <p className="font-headline text-headline-sm font-semibold text-secondary">
            Level up your AI game
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="text-display-md font-display font-bold leading-tight tracking-tight text-on-surface">
              Master the tools of the <span className="text-primary">future.</span>
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-md">
              Join a community of builders, creators, and researchers hunting for the most
              impactful skills in the age of intelligence.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-5 py-2 bg-secondary-container text-on-secondary-container rounded-full text-label-md font-semibold">
                1,200+ Skills
              </span>
              <span className="px-5 py-2 bg-secondary-container text-on-secondary-container rounded-full text-label-md font-semibold">
                Expert Mentors
              </span>
              <span className="px-5 py-2 bg-secondary-container text-on-secondary-container rounded-full text-label-md font-semibold">
                Daily Challenges
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-label-md text-outline">
          © 2026 Skills Hunter. Built for the AI Generation.
        </div>
      </section>

      {/* Right: form */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-md flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="md:hidden mb-6">
              <Link
                href="/"
                className="text-display-sm font-display font-black text-primary tracking-tighter"
              >
                Skills Hunter
              </Link>
            </div>
            <h1 className="text-display-lg font-display font-bold text-on-surface tracking-tight">
              Hello!
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Welcome back. Ready for your next hunt?
            </p>
          </div>

          <button
            disabled
            className="bounce-active flex items-center justify-center gap-4 w-full py-4 px-8 bg-surface-container-highest text-on-secondary-container rounded-xl font-headline font-semibold transition-all hover:bg-surface-variant disabled:opacity-60"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Login with GitHub (coming soon)
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-outline-variant opacity-30" />
            <span className="text-label-md text-outline font-medium">OR EMAIL</span>
            <div className="h-px flex-1 bg-outline-variant opacity-30" />
          </div>

          <form className="flex flex-col gap-6" action="#">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-semibold text-secondary ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="hunter@ai.com"
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-low ghost-border rounded-xl focus:ring-2 focus:ring-primary text-body-lg placeholder:text-outline transition-all outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-label-md font-semibold text-secondary" htmlFor="password">
                  Password
                </label>
                <a className="text-label-sm text-primary font-bold hover:underline" href="#">
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-low ghost-border rounded-xl focus:ring-2 focus:ring-primary text-body-lg placeholder:text-outline transition-all outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled
              className="bounce-active mt-4 primary-gradient w-full py-5 px-8 text-on-primary rounded-xl font-display text-headline-sm font-bold shadow-lg shadow-primary/20 transition-transform disabled:opacity-60"
            >
              Start Using It (coming soon)
            </button>
          </form>

          <p className="text-center text-body-md text-on-surface-variant">
            New to the hunt?{' '}
            <a className="text-primary font-bold hover:underline" href="#">
              Create an account
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
