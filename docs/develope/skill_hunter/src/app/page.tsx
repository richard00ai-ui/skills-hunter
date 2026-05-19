import { getHotSkills } from '@/lib/queries';
import SkillCard from '@/components/SkillCard';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const { skills, total } = await getHotSkills(page);

  return (
    <div className="flex-1 flex max-w-[1600px] mx-auto w-full px-8 gap-8 py-8">
      <Sidebar />

      <main className="flex-1 flex flex-col gap-8 pb-12 min-w-0">
        {/* Hero */}
        <section className="relative rounded-lg overflow-hidden min-h-[340px] flex items-center p-12 bg-surface-container-high">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-display-lg font-display font-black text-on-surface tracking-tighter leading-none mb-4">
              Master the Unexpected
            </h1>
            <p className="text-headline-sm text-on-surface-variant mb-8 leading-relaxed">
              The AI revolution isn&apos;t just about code. It&apos;s about creative prompt
              engineering, ethical oversight, and human-centric design. Find the skill that makes
              you irreplaceable.
            </p>
            <div className="flex gap-4">
              <a
                href="#trending"
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg bounce-active shadow-lg inline-block"
              >
                Browse Collections
              </a>
              <a
                href="/login"
                className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold text-lg bounce-active shadow-sm inline-block"
              >
                Join Community
              </a>
            </div>
          </div>
        </section>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: trending list */}
          <div id="trending" className="xl:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-lg font-display font-bold text-on-surface">
                Trending AI Skills
              </h2>
              <div className="flex gap-2">
                <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-label-md font-bold">
                  Today
                </span>
                <span className="text-on-surface-variant px-4 py-1 rounded-full text-label-md font-medium">
                  This Week
                </span>
              </div>
            </div>

            {skills.length === 0 ? (
              <p className="text-on-surface-variant">
                No skills yet — run the crawler to seed the database.
              </p>
            ) : (
              skills.map((skill, idx) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  rank={(page - 1) * 20 + idx + 1}
                />
              ))
            )}

            <Pagination page={page} total={total} buildHref={(p) => `/?page=${p}`} />
          </div>

          {/* Right column */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            {/* Stats */}
            <div className="bg-gradient-to-br from-secondary to-primary p-8 rounded-lg text-on-primary shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-headline-sm font-bold">New This Week</h3>
                <span className="material-symbols-outlined bg-white/20 p-2 rounded-lg">
                  analytics
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl">
                  <span className="font-medium">Total Skills</span>
                  <span className="text-display-sm font-black">{total}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl">
                  <span className="font-medium">New Paths</span>
                  <span className="text-display-sm font-black">+24</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl">
                  <span className="font-medium">Experts Active</span>
                  <span className="text-display-sm font-black">890</span>
                </div>
              </div>
            </div>

            {/* Explore Niches */}
            <div className="bg-surface-container p-6 rounded-lg">
              <h3 className="text-headline-sm font-bold text-on-surface mb-6">Explore Niches</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: 'psychology', label: 'Prompt Psychology' },
                  { icon: 'security', label: 'AI Governance' },
                  { icon: 'brush', label: 'Fine-Tuning Art' },
                  { icon: 'data_object', label: 'Synthetic Datasets' },
                ].map((n) => (
                  <button
                    key={n.label}
                    className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-primary hover:text-on-primary transition-all group bounce-active"
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary group-hover:text-on-primary">
                        {n.icon}
                      </span>
                      <span className="font-bold">{n.label}</span>
                    </span>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spotlight */}
            <div className="bg-tertiary-container/20 p-6 rounded-lg border-2 border-dashed border-tertiary/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    person
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-bold text-tertiary">Expert Spotlight</p>
                  <p className="text-body-md font-bold">Elena Vance</p>
                </div>
              </div>
              <p className="text-body-md italic text-on-surface-variant mb-4">
                &quot;Mastering the latent space is the new frontier of digital literacy. Start with
                small experiments.&quot;
              </p>
              <button className="text-tertiary font-bold hover:underline flex items-center gap-2">
                Read Elena&apos;s Guide
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
