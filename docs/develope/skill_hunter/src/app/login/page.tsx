import Link from 'next/link';
import { signIn, signUp } from '@/lib/actions';

interface LoginPageProps {
  searchParams: Promise<{ error?: string; mode?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, mode } = await searchParams;
  const isSignUp = mode === 'signup';

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left: brand */}
      <section className="hidden md:flex flex-1 relative overflow-hidden bg-surface-container p-16 flex-col justify-between">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link
            href="/"
            className="text-display-sm font-display font-black text-primary tracking-tighter mb-2 inline-block"
          >
            Skills Hunter
          </Link>
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
              {isSignUp ? 'Join the hunt' : 'Hello!'}
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {isSignUp
                ? 'Create an account to vote and comment.'
                : 'Welcome back. Ready for your next hunt?'}
            </p>
          </div>

          {error && (
            <div className="bg-error-container/40 text-on-error-container rounded-xl p-4 text-body-md">
              {error}
            </div>
          )}

          <form action={isSignUp ? signUp : signIn} className="flex flex-col gap-6">
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
                  name="email"
                  type="email"
                  required
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
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-low ghost-border rounded-xl focus:ring-2 focus:ring-primary text-body-lg placeholder:text-outline transition-all outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bounce-active mt-4 primary-gradient w-full py-5 px-8 text-on-primary rounded-xl font-display text-headline-sm font-bold shadow-lg shadow-primary/20"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-body-md text-on-surface-variant">
            {isSignUp ? (
              <>
                Already a hunter?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to the hunt?{' '}
                <Link href="/login?mode=signup" className="text-primary font-bold hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
