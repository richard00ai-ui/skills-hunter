'use client';

import { useRef, useTransition } from 'react';
import { postComment } from '@/lib/actions';

interface CommentFormProps {
  skillId: string;
}

export default function CommentForm({ skillId }: CommentFormProps) {
  const ref = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={ref}
      action={(formData) => {
        startTransition(async () => {
          await postComment(skillId, formData);
          ref.current?.reset();
        });
      }}
      className="flex flex-col gap-4"
    >
      <textarea
        name="content"
        required
        minLength={1}
        maxLength={2000}
        rows={4}
        placeholder="Share your thoughts on this skill..."
        className="w-full p-4 bg-surface-container-low ghost-border rounded-xl focus:ring-2 focus:ring-primary text-body-lg placeholder:text-outline outline-none resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bounce-active primary-gradient text-on-primary px-8 py-3 rounded-xl font-bold shadow-md disabled:opacity-60"
        >
          {isPending ? 'Posting...' : 'Post comment'}
        </button>
      </div>
    </form>
  );
}
