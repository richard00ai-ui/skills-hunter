'use client';

import { useTransition } from 'react';
import { toggleVote } from '@/lib/actions';

interface VoteButtonProps {
  skillId: string;
  voted: boolean;
  count: number;
}

export default function VoteButton({ skillId, voted, count }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() =>
        startTransition(async () => {
          await toggleVote(skillId);
        })
      }
      className="flex flex-col items-center gap-1 min-w-[60px]"
    >
      <button
        type="submit"
        disabled={isPending}
        className={
          'w-12 h-12 rounded-xl flex items-center justify-center transition-all bounce-active ' +
          (voted
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-primary hover:bg-primary hover:text-on-primary') +
          (isPending ? ' opacity-50' : '')
        }
        aria-label={voted ? 'Remove vote' : 'Upvote'}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          expand_less
        </span>
      </button>
      <span className="font-bold text-headline-sm">{count}</span>
    </form>
  );
}
