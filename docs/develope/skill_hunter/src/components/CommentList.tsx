import type { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
}

function shortHandle(userId: string) {
  return `Hunter ${userId.slice(0, 6)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-body-md text-on-surface-variant">
        No comments yet — be the first to share your thoughts.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((c) => (
        <li key={c.id} className="bg-surface-container-low p-6 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">
                  person
                </span>
              </div>
              <span className="font-bold text-on-surface">{shortHandle(c.user_id)}</span>
            </div>
            <span className="text-label-md text-on-surface-variant">{formatDate(c.created_at)}</span>
          </div>
          <p className="text-body-lg text-on-surface whitespace-pre-wrap">{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
