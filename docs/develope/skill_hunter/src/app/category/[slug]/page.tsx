import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSkillsByCategory } from '@/lib/queries';
import SkillTile from '@/components/SkillTile';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

const ICON_BY_SLUG: Record<string, string> = {
  code: 'terminal',
  writing: 'edit_note',
  design: 'palette',
  research: 'science',
  productivity: 'bolt',
  other: 'apps',
};

const TAGLINE_BY_SLUG: Record<string, string> = {
  code: 'Master the languages that power the digital world. From prompt engineering to full-stack frameworks, discover resources curated for the modern developer.',
  writing: 'Sharpen your craft. AI-augmented writing skills for every form, from short copy to long-form research.',
  design: 'From semantic UI generation to brand systems. Tools that compress your design loop without compromising taste.',
  research: 'Deep work for the AI age — synthesis, citations, evidence chains.',
  productivity: 'Reclaim your day. Skills that compound across weeks, not minutes.',
  other: 'Everything that defies a neat category.',
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = sp.sort === 'new' ? 'new' : 'hot';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const { skills, total, category } = await getSkillsByCategory(slug, sort, page);
  if (!category) notFound();

  return (
    <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 min-w-0">
        {/* Hero */}
        <section className="mb-12 relative rounded-lg overflow-hidden bg-surface-container-high p-12">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-on-primary px-4 py-1 rounded-full text-label-md font-bold">
                Category
              </span>
              <span className="text-on-surface-variant font-medium">
                • {total} skills available
              </span>
            </div>
            <h1 className="text-on-surface font-display font-black text-6xl tracking-tighter mb-6 capitalize">
              {category.name}
            </h1>
            <p className="text-on-surface-variant text-body-lg leading-relaxed mb-8">
              {TAGLINE_BY_SLUG[slug] ?? ''}
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <form action="/search" method="GET" className="relative flex-1 w-full">
                <input type="hidden" name="category" value={slug} />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  search
                </span>
                <input
                  name="q"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline outline-none"
                  placeholder={`Find a ${category.name} skill...`}
                  type="search"
                />
              </form>
              <div className="flex gap-2 p-1 bg-surface-container-low rounded-2xl">
                <Link
                  href={`/category/${slug}?sort=new`}
                  className={
                    sort === 'new'
                      ? 'px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-sm bounce-active'
                      : 'px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-variant rounded-xl bounce-active'
                  }
                >
                  Latest
                </Link>
                <Link
                  href={`/category/${slug}?sort=hot`}
                  className={
                    sort === 'hot'
                      ? 'px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-sm bounce-active'
                      : 'px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-variant rounded-xl bounce-active'
                  }
                >
                  Popular
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        {skills.length === 0 ? (
          <div className="bg-surface-container-low rounded-lg p-12 text-center">
            <p className="text-headline-sm font-bold text-on-surface mb-2">
              No skills in {category.name} yet
            </p>
            <p className="text-body-md text-on-surface-variant">
              The crawler doesn&apos;t auto-classify yet — skills come in uncategorized.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {skills.map((skill, idx) => (
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
                featured={idx === 0}
              />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          total={total}
          buildHref={(p) => `/category/${slug}?sort=${sort}&page=${p}`}
        />
      </main>
    </div>
  );
}
