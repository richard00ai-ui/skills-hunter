import Link from 'next/link';
import type { Skill } from '@/types';

interface SkillCardProps {
  skill: Skill;
  rank?: number;
}

export default function SkillCard({ skill, rank }: SkillCardProps) {
  return (
    <Link
      href={`/skill/${skill.id}`}
      className="bg-surface-container-lowest p-6 rounded-lg flex gap-6 items-start hover:shadow-md transition-shadow group bounce-active"
    >
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1 min-w-[60px]">
        <span
          className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            expand_less
          </span>
        </span>
        <span className="font-bold text-headline-sm">{skill.vote_count}</span>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          {rank !== undefined && (
            <span className={`text-label-md font-bold ${rank === 1 ? 'text-tertiary' : 'text-on-surface-variant'}`}>
              #{rank} Trending
            </span>
          )}
          <span className="flex items-center gap-1 text-tertiary">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-label-md font-bold">{skill.github_stars.toLocaleString()}</span>
          </span>
        </div>
        <h3 className="text-headline-md font-bold text-on-surface mb-2 group-hover:text-primary transition-colors truncate">
          {skill.name}
        </h3>
        <p className="text-body-lg text-on-surface-variant mb-4 line-clamp-2">{skill.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-surface-variant text-on-secondary-fixed-variant px-3 py-1 rounded-full text-label-md">
            {skill.repo}
          </span>
          {skill.category && (
            <span className="bg-surface-variant text-on-secondary-fixed-variant px-3 py-1 rounded-full text-label-md">
              {skill.category.name}
            </span>
          )}
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-surface-variant text-on-secondary-fixed-variant px-3 py-1 rounded-full text-label-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Thumb */}
      <div className="hidden sm:flex w-24 h-24 rounded-lg bg-surface-container-low overflow-hidden items-center justify-center text-primary shrink-0">
        <span
          className="material-symbols-outlined text-5xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
      </div>
    </Link>
  );
}
