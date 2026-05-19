import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSkillById } from '@/lib/queries';

interface SkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { id } = await params;
  const skill = await getSkillById(id);
  if (!skill) notFound();

  return (
    <main className="flex-grow">
      {/* Hero */}
      <section className="bg-surface-container-low py-16 px-8 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-bold text-sm">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {skill.category ? skill.category.name.toUpperCase() : 'AI SKILL'}
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-display font-black text-on-surface tracking-tighter leading-[0.9]">
                {skill.name}
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
                {skill.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href={`https://github.com/${skill.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-10 py-5 rounded-xl text-lg shadow-lg shadow-primary/20 bounce-active inline-block"
              >
                View on GitHub
              </a>
              <a
                href="#install"
                className="bg-surface-container-highest text-on-secondary-container font-bold px-10 py-5 rounded-xl text-lg bounce-active inline-block"
              >
                Install
              </a>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50" />
            <div className="relative bg-surface-container-lowest rounded-xl p-8 shadow-2xl shadow-on-surface/5 flex items-center justify-center aspect-square md:aspect-video overflow-hidden">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: '12rem', fontVariationSettings: "'FILL' 1" }}
              >
                auto_fix_high
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main */}
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-6">
              <h2 className="text-4xl font-display font-bold text-on-surface">What it does</h2>
              <p className="text-body-lg leading-relaxed text-on-surface-variant">
                {skill.description}
              </p>
              {skill.tags.length > 0 && (
                <ul className="mt-6 space-y-4">
                  {skill.tags.map((tag) => (
                    <li key={tag} className="flex gap-4 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span>{tag}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest rounded-lg p-6 text-center">
                <p className="text-display-sm font-black text-primary">{skill.vote_count}</p>
                <p className="text-label-md text-on-surface-variant mt-2">Upvotes</p>
              </div>
              <div className="bg-surface-container-lowest rounded-lg p-6 text-center">
                <p className="text-display-sm font-black text-tertiary">
                  {skill.github_stars.toLocaleString()}
                </p>
                <p className="text-label-md text-on-surface-variant mt-2">GitHub Stars</p>
              </div>
              <div className="bg-surface-container-lowest rounded-lg p-6 text-center">
                <p className="text-display-sm font-black text-secondary">{skill.comment_count}</p>
                <p className="text-label-md text-on-surface-variant mt-2">Comments</p>
              </div>
            </div>

            {/* Comments placeholder */}
            <div className="space-y-8">
              <h2 className="text-4xl font-display font-bold text-on-surface">Community Talk</h2>
              <div className="bg-surface-container-low p-8 rounded-lg">
                <p className="text-body-lg text-on-surface-variant">
                  Sign in to join the discussion. Comments are coming soon.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Terminal */}
            <div
              id="install"
              className="bg-inverse-surface rounded-lg p-6 text-on-primary-fixed shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-error" />
                <div className="w-3 h-3 rounded-full bg-tertiary" />
                <div className="w-3 h-3 rounded-full bg-primary-container" />
                <span className="ml-2 text-xs font-mono opacity-50 text-inverse-on-surface">
                  Terminal
                </span>
              </div>
              <div className="font-mono text-sm">
                <code className="block text-primary-fixed break-all">{skill.install_cmd}</code>
              </div>
            </div>

            {/* Trust badge */}
            <div className="bg-surface-container-high rounded-lg p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-surface-container-lowest text-primary rounded-full flex items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </div>
              <div>
                <div className="font-bold text-on-surface">Open Source</div>
                <div className="text-sm text-on-surface-variant">
                  Source available on GitHub
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-surface-container-lowest rounded-lg p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3">
                  <span className="text-label-md text-secondary">Category</span>
                  {skill.category ? (
                    <Link
                      href={`/category/${skill.category.slug}`}
                      className="font-bold text-on-surface hover:text-primary"
                    >
                      {skill.category.name}
                    </Link>
                  ) : (
                    <span className="font-bold text-on-surface">Uncategorized</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-label-md text-secondary">Repo</span>
                  <a
                    href={`https://github.com/${skill.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-on-surface hover:text-primary truncate ml-4"
                  >
                    {skill.repo}
                  </a>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-label-md text-secondary">Stars</span>
                  <span className="font-bold text-on-surface">
                    {skill.github_stars.toLocaleString()}
                  </span>
                </div>
                {skill.last_updated && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-label-md text-secondary">Updated</span>
                    <span className="font-bold text-on-surface">
                      {new Date(skill.last_updated).toLocaleDateString('en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
