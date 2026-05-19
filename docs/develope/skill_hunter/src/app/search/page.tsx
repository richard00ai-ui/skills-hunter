import Link from 'next/link';
import { searchSkills, getCategories } from '@/lib/queries';
import SkillTile from '@/components/SkillTile';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}

const ICON_BY_SLUG: Record<string, string> = {
  code: 'terminal',
  writing: 'edit_note',
  design: 'palette',
  research: 'science',
  productivity: 'bolt',
  other: 'apps',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const categoryParam = sp.category;
  const sort = sp.sort === 'new' ? 'new' : 'hot';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const [{ skills, total }, categories] = await Promise.all([
    q ? searchSkills(q, categoryParam, sort, page) : Promise.resolve({ skills: [], total: 0 }),
    getCategories(),
  ]);

  const buildLink = (next: Partial<{ category?: string; sort: string; page: string }>) => {
    const p = new URLSearchParams();
    p.set('q', q);
    const cat = next.category !== undefined ? next.category : categoryParam;
    if (cat) p.set('category', cat);
    p.set('sort', next.sort ?? sort);
    if (next.page) p.set('page', next.page);
    return `/search?${p.toString()}`;
  };

  return (
    <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
      <Sidebar />

      <main className="flex-1 px-8 py-12 min-w-0">
        {/* Header */}
        <section className="mb-12">
          <form action="/search" method="GET" className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                search
              </span>
              <input
                name="q"
                defaultValue={q}
                type="search"
                placeholder="Search skills..."
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-xl shadow-md bounce-active"
            >
              Search
            </button>
          </form>

          {q && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-display-sm font-display font-bold text-on-surface tracking-tight mb-2">
                  Search results for &lsquo;{q}&rsquo;
                </h1>
                <p className="text-body-lg text-on-surface-variant">
                  Found {total} skill{total === 1 ? '' : 's'} matching your query.
                </p>
              </div>
            </div>
          )}
        </section>

        {q && (
          <>
            {/* Filter chips */}
            <section className="mb-10 flex flex-wrap items-center gap-3">
              <Link
                href={buildLink({ category: '', page: '1' })}
                className={
                  !categoryParam
                    ? 'px-6 py-2 rounded-full bg-primary text-on-primary font-bold bounce-active'
                    : 'px-6 py-2 rounded-full bg-secondary-container text-on-secondary-container font-medium hover:bg-surface-variant bounce-active'
                }
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildLink({ category: cat.slug, page: '1' })}
                  className={
                    categoryParam === cat.slug
                      ? 'px-6 py-2 rounded-full bg-primary text-on-primary font-bold bounce-active'
                      : 'px-6 py-2 rounded-full bg-secondary-container text-on-secondary-container font-medium hover:bg-surface-variant bounce-active'
                  }
                >
                  {cat.name}
                </Link>
              ))}
              <div className="ml-auto flex gap-2 p-1 bg-surface-container-low rounded-2xl">
                <Link
                  href={buildLink({ sort: 'hot', page: '1' })}
                  className={
                    sort === 'hot'
                      ? 'px-5 py-2 bg-primary text-on-primary rounded-xl font-bold bounce-active'
                      : 'px-5 py-2 text-on-surface-variant font-bold hover:bg-surface-variant rounded-xl bounce-active'
                  }
                >
                  Popular
                </Link>
                <Link
                  href={buildLink({ sort: 'new', page: '1' })}
                  className={
                    sort === 'new'
                      ? 'px-5 py-2 bg-primary text-on-primary rounded-xl font-bold bounce-active'
                      : 'px-5 py-2 text-on-surface-variant font-bold hover:bg-surface-variant rounded-xl bounce-active'
                  }
                >
                  Newest
                </Link>
              </div>
            </section>

            {/* Results */}
            {skills.length === 0 ? (
              <div className="bg-surface-container-low rounded-lg p-12 text-center">
                <p className="text-headline-sm font-bold text-on-surface mb-2">No matches</p>
                <p className="text-body-md text-on-surface-variant">
                  Try a different keyword or remove filters.
                </p>
              </div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {skills.map((skill, idx) => {
                  const slug = skill.category?.slug ?? 'other';
                  return (
                    <SkillTile
                      key={skill.id}
                      skill={skill}
                      icon={ICON_BY_SLUG[slug] ?? 'auto_awesome'}
                      iconBg={
                        idx % 4 === 0
                          ? 'primary-container'
                          : idx % 4 === 1
                            ? 'secondary-container'
                            : idx % 4 === 2
                              ? 'tertiary-container'
                              : 'surface-container'
                      }
                    />
                  );
                })}
              </section>
            )}

            <Pagination
              page={page}
              total={total}
              buildHref={(p) => buildLink({ page: String(p) })}
            />
          </>
        )}

        {!q && (
          <p className="text-on-surface-variant text-body-lg">
            Enter a keyword above to search through all skills.
          </p>
        )}
      </main>
    </div>
  );
}
