import Link from 'next/link';
import type { Category } from '@/types';

interface NavbarProps {
  categories: Category[];
  activeSlug?: string;
}

const CATEGORY_LABEL_EN: Record<string, string> = {
  code: 'Code',
  writing: 'Writing',
  design: 'Design',
  research: 'Research',
  productivity: 'Productivity',
  other: 'Other',
};

export default function Navbar({ categories, activeSlug }: NavbarProps) {
  return (
    <header className="w-full top-0 sticky z-50 bg-surface-container-low shadow-sm px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-display-sm font-display font-black text-primary tracking-tighter"
        >
          Skills Hunter
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => {
            const active = cat.slug === activeSlug;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={
                  active
                    ? 'text-primary font-bold border-b-4 border-primary pb-1 transition-colors duration-200'
                    : 'text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-200'
                }
              >
                {CATEGORY_LABEL_EN[cat.slug] ?? cat.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <form action="/search" method="GET" className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            name="q"
            type="search"
            placeholder="Search skills..."
            className="bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary text-body-md transition-all outline-none"
          />
        </form>
        <Link
          href="/login"
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-xl font-bold bounce-active transition-transform shadow-md inline-block"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
