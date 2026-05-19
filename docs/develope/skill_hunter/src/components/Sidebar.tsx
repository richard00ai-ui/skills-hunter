import Link from 'next/link';

interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

const ITEMS: SidebarItem[] = [
  { icon: 'trending_up', label: 'Trending Skills', href: '/', active: true },
  { icon: 'neurology', label: 'New Additions', href: '/?sort=new' },
  { icon: 'military_tech', label: 'Top Experts', href: '/leaderboard' },
  { icon: 'emoji_events', label: 'Daily Challenges', href: '#' },
  { icon: 'map', label: 'Learning Paths', href: '#' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex h-[calc(100vh-120px)] w-72 rounded-r-lg flex-col p-6 gap-2 bg-surface-container-low sticky top-24">
      <div className="mb-6">
        <h2 className="font-headline text-headline-sm font-semibold text-primary">Discovery Hub</h2>
        <p className="text-label-md text-on-surface-variant">Level up your AI game</p>
      </div>
      <nav className="flex flex-col gap-2">
        {ITEMS.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className={
              it.active
                ? 'bg-primary text-on-primary rounded-xl flex items-center gap-3 p-4 bounce-active'
                : 'text-on-surface-variant hover:bg-surface-variant rounded-xl flex items-center gap-3 p-4 bounce-active'
            }
          >
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="font-medium">{it.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-secondary-container">person</span>
        </div>
        <div>
          <p className="text-label-md font-bold">Guest Hunter</p>
          <p className="text-[10px] text-on-surface-variant">Rank: Novice</p>
        </div>
      </div>
    </aside>
  );
}
