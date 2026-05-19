import Link from 'next/link';
import type { Skill } from '@/types';

interface SkillTileProps {
  skill: Skill;
  featured?: boolean;
  iconBg?: 'primary-container' | 'secondary-container' | 'tertiary-container' | 'surface-container';
  icon?: string;
}

const ICON_BG_CLASS: Record<NonNullable<SkillTileProps['iconBg']>, string> = {
  'primary-container': 'bg-primary-container text-on-primary-container',
  'secondary-container': 'bg-secondary-container text-on-secondary-container',
  'tertiary-container': 'bg-tertiary-container text-on-tertiary-container',
  'surface-container': 'bg-surface-container text-primary',
};

export default function SkillTile({
  skill,
  featured = false,
  iconBg = 'primary-container',
  icon = 'terminal',
}: SkillTileProps) {
  return (
    <Link
      href={`/skill/${skill.id}`}
      className="bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 group bounce-active cursor-pointer flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <div
          className={`w-16 h-16 rounded-2xl ${ICON_BG_CLASS[iconBg]} flex items-center justify-center`}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        {featured && (
          <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-label-md font-bold">
            Featured
          </span>
        )}
      </div>
      <div>
        <h3 className="text-on-surface font-display font-bold text-headline-sm mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {skill.name}
        </h3>
        <p className="text-on-surface-variant text-body-md line-clamp-2">{skill.description}</p>
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-secondary text-sm">code</span>
          <span className="text-label-md text-secondary font-semibold truncate">{skill.repo}</span>
        </div>
        <div className="text-right shrink-0">
          <span className="block text-label-md text-on-surface-variant">Votes</span>
          <span className="font-display font-black text-primary text-headline-sm">
            {skill.vote_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
