# Skills Hunter — Plan 3: Social Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user authentication (email + GitHub OAuth), voting (upvote/undo per skill), and comments (post + list per skill detail page).

**Architecture:** Supabase Auth handles login sessions via cookies (using `@supabase/ssr`). A Next.js middleware refreshes the session on every request. Voting and comment submission use Next.js Server Actions — no separate API routes needed. `vote_count` and `comment_count` on the `skills` table are kept in sync via Postgres triggers.

**Tech Stack:** Next.js 14 Server Actions, Supabase Auth (email + GitHub OAuth), Postgres triggers, `@supabase/ssr`

**Prerequisite:** Plans 1 and 2 complete — database, UI, and Supabase clients all in place.

---

## File Map

| File | Responsibility |
|------|----------------|
| `src/middleware.ts` | Refresh Supabase session cookie on every request |
| `src/app/login/page.tsx` | Login page — email/password form + GitHub OAuth button |
| `src/app/auth/callback/route.ts` | OAuth callback handler — exchanges code for session |
| `src/lib/actions.ts` | Server Actions: `vote`, `unvote`, `postComment` |
| `src/components/VoteButton.tsx` | Client component — shows vote count, toggles vote |
| `src/components/CommentForm.tsx` | Client component — textarea + submit button |
| `src/components/CommentList.tsx` | Server component — renders comment list |
| `supabase/migrations/002_triggers.sql` | Postgres triggers to keep vote_count and comment_count in sync |

---

## Task 1: Session Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Write middleware**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this line
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 2: Confirm TypeScript**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Supabase session middleware"
```

---

## Task 2: Login Page

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Enable GitHub OAuth in Supabase**

Go to Supabase Dashboard → Authentication → Providers → GitHub → enable it.

In GitHub: go to Settings → Developer settings → OAuth Apps → New OAuth App:
- Homepage URL: your Vercel URL (or `http://localhost:3000` for local)
- Callback URL: `https://your-project.supabase.co/auth/v1/callback`

Copy Client ID and Client Secret back into the Supabase GitHub provider fields → Save.

- [ ] **Step 2: Write login page**

```tsx
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  async function handleGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        {isSignUp ? '注册账号' : '登录'}
      </h1>

      {/* GitHub OAuth */}
      <button
        onClick={handleGitHub}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white hover:bg-gray-800"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        使用 GitHub 登录
      </button>

      <div className="mb-4 flex items-center gap-3 text-gray-600">
        <hr className="flex-1 border-gray-700" />
        <span className="text-xs">或</span>
        <hr className="flex-1 border-gray-700" />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? '请稍候...' : isSignUp ? '注册' : '登录'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 w-full text-center text-sm text-gray-500 hover:text-white"
      >
        {isSignUp ? '已有账号？登录' : '没有账号？注册'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Write OAuth callback route**

```typescript
// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(origin);
}
```

- [ ] **Step 4: Add login link to Navbar**

Open `src/components/Navbar.tsx`, import `createClient` from `@/lib/supabase-server` and add a login/logout link. Replace the Navbar with:

```tsx
// src/components/Navbar.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import type { Category } from '@/types';

interface NavbarProps {
  categories: Category[];
}

export default async function Navbar({ categories }: NavbarProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-6">
        <Link href="/" className="text-lg font-bold text-white">
          Skills Hunter
        </Link>

        <div className="hidden gap-4 md:flex">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-sm text-gray-400 hover:text-white"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <form action="/search" method="GET" className="ml-auto flex items-center gap-3">
          <input
            name="q"
            type="search"
            placeholder="搜索 skills..."
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {user ? (
            <form action="/auth/signout" method="POST">
              <button className="text-sm text-gray-400 hover:text-white">退出</button>
            </form>
          ) : (
            <Link href="/login" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
              登录
            </Link>
          )}
        </form>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Add sign-out route**

```typescript
// src/app/auth/signout/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
```

- [ ] **Step 6: Add `NEXT_PUBLIC_SITE_URL` to `.env.local` and `.env.example`**

`.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.example`:
```
NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app
```

- [ ] **Step 7: Verify login works in browser**

Start dev server. Click "登录" in nav → fill in email/password or use GitHub → should redirect to homepage as logged-in user.

- [ ] **Step 8: Commit**

```bash
git add src/middleware.ts src/app/login/ src/app/auth/ src/components/Navbar.tsx .env.example
git commit -m "feat: add auth — login page, GitHub OAuth, session middleware"
```

---

## Task 3: Postgres Triggers for vote_count / comment_count

**Files:**
- Create: `supabase/migrations/002_triggers.sql`

- [ ] **Step 1: Write trigger migration**

```sql
-- supabase/migrations/002_triggers.sql

-- ── vote_count trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE skills SET vote_count = vote_count + 1 WHERE id = NEW.skill_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skills SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.skill_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_vote_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- ── comment_count trigger ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE skills SET comment_count = comment_count + 1 WHERE id = NEW.skill_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skills SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.skill_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();
```

- [ ] **Step 2: Run migration on Supabase**

Go to Supabase Dashboard → SQL Editor → paste `002_triggers.sql` contents → Run.

Expected: "Success. No rows returned"

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_triggers.sql
git commit -m "feat: add Postgres triggers for vote_count and comment_count"
```

---

## Task 4: Server Actions (Vote + Comment)

**Files:**
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Write server actions**

```typescript
// src/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';

// ── Voting ────────────────────────────────────────────────────────────────────

export async function vote(skillId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '请先登录' };

  const { error } = await supabase
    .from('votes')
    .insert({ user_id: user.id, skill_id: skillId });

  if (error?.code === '23505') return { error: 'already_voted' }; // unique violation
  if (error) return { error: error.message };

  revalidatePath(`/skill/${skillId}`);
  revalidatePath('/');
  return {};
}

export async function unvote(skillId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '请先登录' };

  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('user_id', user.id)
    .eq('skill_id', skillId);

  if (error) return { error: error.message };

  revalidatePath(`/skill/${skillId}`);
  revalidatePath('/');
  return {};
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function postComment(
  skillId: string,
  content: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '请先登录' };

  const trimmed = content.trim();
  if (!trimmed) return { error: '评论不能为空' };
  if (trimmed.length > 1000) return { error: '评论不能超过 1000 字' };

  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, skill_id: skillId, content: trimmed });

  if (error) return { error: error.message };

  revalidatePath(`/skill/${skillId}`);
  return {};
}
```

- [ ] **Step 2: Confirm TypeScript**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions.ts
git commit -m "feat: add vote and comment server actions"
```

---

## Task 5: VoteButton Component

**Files:**
- Create: `src/components/VoteButton.tsx`
- Create: `__tests__/VoteButton.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// __tests__/VoteButton.test.tsx
import { render, screen } from '@testing-library/react';
import VoteButton from '@/components/VoteButton';

test('shows vote count', () => {
  render(<VoteButton skillId="abc" voteCount={42} hasVoted={false} isLoggedIn={true} />);
  expect(screen.getByText('42')).toBeInTheDocument();
});

test('shows filled arrow when voted', () => {
  render(<VoteButton skillId="abc" voteCount={42} hasVoted={true} isLoggedIn={true} />);
  const btn = screen.getByRole('button');
  expect(btn).toHaveClass('text-amber-400');
});

test('shows muted arrow when not voted', () => {
  render(<VoteButton skillId="abc" voteCount={42} hasVoted={false} isLoggedIn={true} />);
  const btn = screen.getByRole('button');
  expect(btn).toHaveClass('text-gray-500');
});
```

- [ ] **Step 2: Run tests — confirm fail**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/VoteButton.test.tsx 2>&1 | tail -5
```

Expected: `Cannot find module '@/components/VoteButton'`

- [ ] **Step 3: Write `src/components/VoteButton.tsx`**

```tsx
// src/components/VoteButton.tsx
'use client';

import { useTransition } from 'react';
import { vote, unvote } from '@/lib/actions';

interface VoteButtonProps {
  skillId: string;
  voteCount: number;
  hasVoted: boolean;
  isLoggedIn: boolean;
}

export default function VoteButton({ skillId, voteCount, hasVoted, isLoggedIn }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    startTransition(async () => {
      if (hasVoted) {
        await unvote(skillId);
      } else {
        await vote(skillId);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        hasVoted
          ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
          : 'text-gray-500 hover:text-white hover:bg-gray-800'
      } disabled:opacity-50`}
    >
      <span>▲</span>
      <span>{voteCount}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/VoteButton.test.tsx
```

Expected:
```
PASS  __tests__/VoteButton.test.tsx
  ✓ shows vote count
  ✓ shows filled arrow when voted
  ✓ shows muted arrow when not voted
Tests: 3 passed, 3 total
```

- [ ] **Step 5: Commit**

```bash
git add src/components/VoteButton.tsx __tests__/VoteButton.test.tsx
git commit -m "feat: add VoteButton component with tests"
```

---

## Task 6: Comment Components

**Files:**
- Create: `src/components/CommentForm.tsx`
- Create: `src/components/CommentList.tsx`

- [ ] **Step 1: Write `src/components/CommentForm.tsx`**

```tsx
// src/components/CommentForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { postComment } from '@/lib/actions';

interface CommentFormProps {
  skillId: string;
}

export default function CommentForm({ skillId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await postComment(skillId, content);
      if (result.error) {
        setError(result.error);
      } else {
        setContent('');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的想法..."
        rows={3}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? '发送中...' : '发表评论'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Write `src/components/CommentList.tsx`**

```tsx
// src/components/CommentList.tsx
import { createClient } from '@/lib/supabase-server';
import type { Comment } from '@/types';

interface CommentListProps {
  skillId: string;
}

export default async function CommentList({ skillId }: CommentListProps) {
  const supabase = await createClient();
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-gray-500">还没有评论，来第一个吧！</p>;
  }

  return (
    <div className="space-y-4">
      {(comments as Comment[]).map((comment) => (
        <div key={comment.id} className="rounded-lg bg-gray-900 p-4">
          <p className="mb-2 text-sm text-white">{comment.content}</p>
          <p className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleDateString('zh-CN')}
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CommentForm.tsx src/components/CommentList.tsx
git commit -m "feat: add CommentForm and CommentList components"
```

---

## Task 7: Wire Up Skill Detail Page

**Files:**
- Modify: `src/app/skill/[id]/page.tsx`

- [ ] **Step 1: Update skill detail page to use VoteButton, CommentForm, CommentList**

```tsx
// src/app/skill/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getSkillById } from '@/lib/queries';
import { createClient } from '@/lib/supabase-server';
import VoteButton from '@/components/VoteButton';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import Link from 'next/link';

interface SkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { id } = await params;
  const [skill, supabase] = await Promise.all([
    getSkillById(id),
    createClient(),
  ]);

  if (!skill) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Check if current user has voted
  let hasVoted = false;
  if (user) {
    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_id', skill.id)
      .maybeSingle();
    hasVoted = !!data;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl font-bold text-white">{skill.name}</h1>
          {skill.category && (
            <Link
              href={`/category/${skill.category.slug}`}
              className="mt-1 inline-block text-sm text-indigo-400 hover:underline"
            >
              {skill.category.name}
            </Link>
          )}
        </div>
        <VoteButton
          skillId={skill.id}
          voteCount={skill.vote_count}
          hasVoted={hasVoted}
          isLoggedIn={!!user}
        />
      </div>

      {/* Description */}
      <p className="mb-6 text-gray-300">{skill.description}</p>

      {/* Tags */}
      {skill.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-800 px-3 py-1 font-mono text-sm text-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 flex gap-6 text-sm text-gray-400">
        <span>★ <span className="font-semibold text-white">{skill.github_stars.toLocaleString()}</span> stars</span>
        <span>💬 <span className="font-semibold text-white">{skill.comment_count}</span> 评论</span>
      </div>

      {/* Install box */}
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">安装命令</p>
        <code className="block font-mono text-sm text-green-400">{skill.install_cmd}</code>
      </div>

      {/* Meta */}
      <div className="mb-8 space-y-2 text-sm text-gray-500">
        <div>
          来源仓库：{' '}
          <a
            href={`https://github.com/${skill.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            {skill.repo}
          </a>
        </div>
        {skill.last_updated && (
          <div>最近更新：{new Date(skill.last_updated).toLocaleDateString('zh-CN')}</div>
        )}
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">💬 评论区</h2>
        {user ? (
          <CommentForm skillId={skill.id} />
        ) : (
          <p className="mb-4 text-sm text-gray-500">
            <Link href="/login" className="text-indigo-400 hover:underline">登录</Link> 后参与讨论
          </p>
        )}
        <CommentList skillId={skill.id} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test the full flow in browser**

1. Go to http://localhost:3000 → click a skill card
2. Without login: vote button should redirect to `/login`; comment form shows login prompt
3. Log in via GitHub or email
4. Return to skill detail: click vote → count increments; write a comment → appears in list
5. Click vote again → count decrements (undo)

- [ ] **Step 3: Push to Vercel**

```bash
git add src/app/skill/ src/app/auth/
git commit -m "feat: wire up voting and comments on skill detail page"
git push origin main
```

Add `NEXT_PUBLIC_SITE_URL` to Vercel environment variables (Settings → Environment Variables) → Redeploy.

---

**Plan 3 complete.** Skills Hunter MVP is fully functional — users can browse skills, search, vote, and comment. All three plans delivered.
