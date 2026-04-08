# Skills Hunter — Plan 2: Core UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full browsing experience — homepage with hot-list, skill cards, skill detail page, category pages, and search — all reading from Supabase.

**Architecture:** Next.js App Router Server Components fetch data from Supabase on the server (no client-side fetching for initial page load). Shared UI components live in `src/components/`. All Supabase read queries are centralised in `src/lib/queries.ts`. The `skills_ranked` view (created in Plan 1) powers the homepage hot-list.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (via `supabase-server.ts`), React Testing Library + Jest

**Prerequisite:** Plan 1 complete — database seeded, Supabase clients exist at `src/lib/supabase-browser.ts` and `src/lib/supabase-server.ts`.

---

## File Map

| File | Responsibility |
|------|----------------|
| `src/lib/queries.ts` | All Supabase read queries (skills, categories, search) |
| `src/components/Navbar.tsx` | Top navigation bar with logo, category links, search input |
| `src/components/SkillCard.tsx` | Single skill card — visual-first, shows name/desc/tags/votes/comments/stars |
| `src/components/Pagination.tsx` | Page number controls (prev/next + numbered) |
| `src/app/layout.tsx` | Root layout — wraps all pages with Navbar |
| `src/app/page.tsx` | Homepage — hot-list from `skills_ranked`, 20 per page |
| `src/app/category/[slug]/page.tsx` | Category page — all skills in one category, sortable |
| `src/app/skill/[id]/page.tsx` | Skill detail page — full info + install command + comment area placeholder |
| `src/app/search/page.tsx` | Search results page — full-text query + category filter |
| `__tests__/SkillCard.test.tsx` | Renders card with all expected fields visible |
| `__tests__/queries.test.ts` | Unit tests for query helper functions (mocked Supabase) |

---

## Task 1: Query Library

**Files:**
- Create: `src/lib/queries.ts`
- Create: `__tests__/queries.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/queries.test.ts
import { buildSearchQuery } from '@/lib/queries';

describe('buildSearchQuery', () => {
  test('returns query string for full-text search', () => {
    expect(buildSearchQuery('brainstorm')).toBe("name.ilike.%brainstorm%,description.ilike.%brainstorm%");
  });

  test('trims whitespace', () => {
    expect(buildSearchQuery('  foo  ')).toBe("name.ilike.%foo%,description.ilike.%foo%");
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/queries.test.ts 2>&1 | tail -10
```

Expected: `Cannot find module '@/lib/queries'`

- [ ] **Step 3: Write `src/lib/queries.ts`**

```typescript
// src/lib/queries.ts
import { createClient } from '@/lib/supabase-server';
import type { Skill, SkillRanked, Category } from '@/types';

const PAGE_SIZE = 20;

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

// ── Hot-list (homepage) ───────────────────────────────────────────────────────

export async function getHotSkills(page = 1): Promise<{ skills: SkillRanked[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('skills_ranked')
    .select('*, category:categories(id,name,slug)', { count: 'exact' })
    .order('score', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { skills: (data ?? []) as SkillRanked[], total: count ?? 0 };
}

// ── Category page ─────────────────────────────────────────────────────────────

export async function getSkillsByCategory(
  slug: string,
  sort: 'hot' | 'new' = 'hot',
  page = 1
): Promise<{ skills: Skill[]; total: number; category: Category | null }> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) return { skills: [], total: 0, category: null };

  const query = supabase
    .from(sort === 'hot' ? 'skills_ranked' : 'skills')
    .select('*, category:categories(id,name,slug)', { count: 'exact' })
    .eq('category_id', category.id)
    .range(from, to);

  const ordered = sort === 'hot'
    ? query.order('score', { ascending: false })
    : query.order('created_at', { ascending: false });

  const { data, error, count } = await ordered;
  if (error) throw error;
  return { skills: (data ?? []) as Skill[], total: count ?? 0, category };
}

// ── Skill detail ──────────────────────────────────────────────────────────────

export async function getSkillById(id: string): Promise<Skill | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*, category:categories(id,name,slug)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Skill;
}

// ── Search ────────────────────────────────────────────────────────────────────

// Exported for unit tests
export function buildSearchQuery(term: string): string {
  const t = term.trim();
  return `name.ilike.%${t}%,description.ilike.%${t}%`;
}

export async function searchSkills(
  term: string,
  categorySlug?: string,
  sort: 'hot' | 'new' = 'hot',
  page = 1
): Promise<{ skills: Skill[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const t = term.trim();

  let query = supabase
    .from(sort === 'hot' ? 'skills_ranked' : 'skills')
    .select('*, category:categories(id,name,slug)', { count: 'exact' })
    .or(`name.ilike.%${t}%,description.ilike.%${t}%`)
    .range(from, to);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const ordered = sort === 'hot'
    ? query.order('score', { ascending: false })
    : query.order('created_at', { ascending: false });

  const { data, error, count } = await ordered;
  if (error) throw error;
  return { skills: (data ?? []) as Skill[], total: count ?? 0 };
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/queries.test.ts
```

Expected:
```
PASS  __tests__/queries.test.ts
  buildSearchQuery
    ✓ returns query string for full-text search
    ✓ trims whitespace
Tests: 2 passed, 2 total
```

- [ ] **Step 5: Confirm TypeScript**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries.ts __tests__/queries.test.ts
git commit -m "feat: add Supabase query library"
```

---

## Task 2: Shared Components — Navbar & Pagination

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Pagination.tsx`

- [ ] **Step 1: Write `src/components/Navbar.tsx`**

```tsx
// src/components/Navbar.tsx
import Link from 'next/link';
import type { Category } from '@/types';

interface NavbarProps {
  categories: Category[];
}

export default function Navbar({ categories }: NavbarProps) {
  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-6">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-white">
          Skills Hunter
        </Link>

        {/* Category links */}
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

        {/* Search */}
        <form action="/search" method="GET" className="ml-auto flex items-center">
          <input
            name="q"
            type="search"
            placeholder="搜索 skills..."
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Write `src/components/Pagination.tsx`**

```tsx
// src/components/Pagination.tsx
import Link from 'next/link';

interface PaginationProps {
  page: number;
  total: number;
  pageSize?: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ page, total, pageSize = 20, buildHref }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="rounded px-3 py-1 text-sm text-gray-400 hover:text-white">
          ← 上一页
        </Link>
      )}
      <span className="text-sm text-gray-500">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className="rounded px-3 py-1 text-sm text-gray-400 hover:text-white">
          下一页 →
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx src/components/Pagination.tsx
git commit -m "feat: add Navbar and Pagination components"
```

---

## Task 3: SkillCard Component

**Files:**
- Create: `src/components/SkillCard.tsx`
- Create: `__tests__/SkillCard.test.tsx`

- [ ] **Step 1: Install React Testing Library**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  jest-environment-jsdom
```

Add to `package.json` `"jest"` config:

```json
"jest": {
  "testEnvironment": "node",
  "testPathPattern": {
    "__tests__/crawl": "node",
    "__tests__/queries": "node"
  },
  "projects": [
    {
      "displayName": "node",
      "testEnvironment": "node",
      "testMatch": ["**/__tests__/crawl*", "**/__tests__/queries*"]
    },
    {
      "displayName": "jsdom",
      "testEnvironment": "jsdom",
      "testMatch": ["**/__tests__/*.test.tsx"],
      "setupFilesAfterFramework": ["@testing-library/jest-dom"]
    }
  ]
}
```

Actually, simpler — replace the jest config in `package.json` with:

```json
"jest": {
  "testEnvironment": "jsdom",
  "setupFilesAfterFramework": ["@testing-library/jest-dom"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "transform": {
    "^.+\\.(ts|tsx)$": ["babel-jest", {"presets": ["next/babel"]}]
  }
}
```

- [ ] **Step 2: Write failing test**

```tsx
// __tests__/SkillCard.test.tsx
import { render, screen } from '@testing-library/react';
import SkillCard from '@/components/SkillCard';
import type { Skill } from '@/types';

const mockSkill: Skill = {
  id: 'abc-123',
  skill_id: 'obra/superpowers/brainstorming',
  name: 'brainstorming',
  repo: 'obra/superpowers',
  description: 'Turn ideas into designs through dialogue',
  install_cmd: 'npx skills add obra/superpowers',
  category_id: null,
  tags: ['design', 'planning'],
  github_stars: 342,
  last_updated: '2026-04-01T00:00:00Z',
  created_at: '2026-03-01T00:00:00Z',
  vote_count: 128,
  comment_count: 14,
};

test('renders skill name', () => {
  render(<SkillCard skill={mockSkill} />);
  expect(screen.getByText('brainstorming')).toBeInTheDocument();
});

test('renders description', () => {
  render(<SkillCard skill={mockSkill} />);
  expect(screen.getByText('Turn ideas into designs through dialogue')).toBeInTheDocument();
});

test('renders vote count', () => {
  render(<SkillCard skill={mockSkill} />);
  expect(screen.getByText('128')).toBeInTheDocument();
});

test('renders github stars', () => {
  render(<SkillCard skill={mockSkill} />);
  expect(screen.getByText('342')).toBeInTheDocument();
});

test('renders tags', () => {
  render(<SkillCard skill={mockSkill} />);
  expect(screen.getByText('#design')).toBeInTheDocument();
  expect(screen.getByText('#planning')).toBeInTheDocument();
});

test('links to skill detail page', () => {
  render(<SkillCard skill={mockSkill} />);
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', '/skill/abc-123');
});
```

- [ ] **Step 3: Run tests — confirm they fail**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/SkillCard.test.tsx 2>&1 | tail -5
```

Expected: `Cannot find module '@/components/SkillCard'`

- [ ] **Step 4: Write `src/components/SkillCard.tsx`**

```tsx
// src/components/SkillCard.tsx
import Link from 'next/link';
import type { Skill } from '@/types';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link href={`/skill/${skill.id}`} className="block">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-900/20">
        {/* Header: name + stars */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="font-mono text-base font-semibold text-white">
            {skill.name}
          </h2>
          <div className="flex shrink-0 items-center gap-1 text-xs text-yellow-400">
            <span>★</span>
            <span>{skill.github_stars.toLocaleString()}</span>
          </div>
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-sm text-gray-400">
          {skill.description}
        </p>

        {/* Tags */}
        {skill.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-800 px-2 py-0.5 font-mono text-xs text-indigo-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: votes + comments */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-amber-400">▲</span>
            <span className="font-medium text-white">{skill.vote_count}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>💬</span>
            <span>{skill.comment_count}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/SkillCard.test.tsx
```

Expected:
```
PASS  __tests__/SkillCard.test.tsx
  ✓ renders skill name
  ✓ renders description
  ✓ renders vote count
  ✓ renders github stars
  ✓ renders tags
  ✓ links to skill detail page
Tests: 6 passed, 6 total
```

- [ ] **Step 6: Commit**

```bash
git add src/components/SkillCard.tsx __tests__/SkillCard.test.tsx package.json
git commit -m "feat: add SkillCard component with tests"
```

---

## Task 4: Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { getCategories } from '@/lib/queries';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skills Hunter — 发现最热门的 AI Skills',
  description: '面向 AI 开发者的 skills 发现与收集平台',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <Navbar categories={categories} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: update root layout with Navbar"
```

---

## Task 5: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write homepage**

```tsx
// src/app/page.tsx
import { getHotSkills } from '@/lib/queries';
import SkillCard from '@/components/SkillCard';
import Pagination from '@/components/Pagination';

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const { skills, total } = await getHotSkills(page);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🔥 本周热榜</h1>
        <p className="mt-1 text-sm text-gray-400">共 {total} 个 skills</p>
      </div>

      {skills.length === 0 ? (
        <p className="text-gray-500">暂无数据，请先运行抓取脚本。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        buildHref={(p) => `/?page=${p}`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify homepage**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm run dev
```

Open http://localhost:3000 — should show a grid of skill cards from the database.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add homepage with hot-list"
```

---

## Task 6: Category Page

**Files:**
- Create: `src/app/category/[slug]/page.tsx`

- [ ] **Step 1: Write category page**

```tsx
// src/app/category/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getSkillsByCategory } from '@/lib/queries';
import SkillCard from '@/components/SkillCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = sp.sort === 'new' ? 'new' : 'hot';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const { skills, total, category } = await getSkillsByCategory(slug, sort, page);

  if (!category) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{category.name}</h1>
          <p className="mt-1 text-sm text-gray-400">共 {total} 个 skills</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/category/${slug}?sort=hot`}
            className={sort === 'hot' ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}
          >
            最热
          </Link>
          <Link
            href={`/category/${slug}?sort=new`}
            className={sort === 'new' ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}
          >
            最新
          </Link>
        </div>
      </div>

      {skills.length === 0 ? (
        <p className="text-gray-500">该分类暂无 skills。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        buildHref={(p) => `/category/${slug}?sort=${sort}&page=${p}`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to http://localhost:3000/category/code — should show skills in the 代码开发 category (or empty state if none assigned yet).

- [ ] **Step 3: Commit**

```bash
git add src/app/category/
git commit -m "feat: add category page with sort toggle"
```

---

## Task 7: Skill Detail Page

**Files:**
- Create: `src/app/skill/[id]/page.tsx`

- [ ] **Step 1: Write detail page**

```tsx
// src/app/skill/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getSkillById } from '@/lib/queries';
import Link from 'next/link';

interface SkillPageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { id } = await params;
  const skill = await getSkillById(id);
  if (!skill) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
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
        <span className="flex items-center gap-1">
          <span className="text-amber-400">▲</span>
          <span className="font-semibold text-white">{skill.vote_count}</span> 票
        </span>
        <span className="flex items-center gap-1">
          ★ <span className="font-semibold text-white">{skill.github_stars.toLocaleString()}</span> stars
        </span>
        <span className="flex items-center gap-1">
          💬 <span className="font-semibold text-white">{skill.comment_count}</span> 评论
        </span>
      </div>

      {/* Install box */}
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">安装命令</p>
        <code className="block font-mono text-sm text-green-400">{skill.install_cmd}</code>
      </div>

      {/* Meta */}
      <div className="mb-8 space-y-2 text-sm text-gray-500">
        <div>
          来源仓库：
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

      {/* Comments placeholder — wired up in Plan 3 */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">💬 评论区</h2>
        <p className="text-sm text-gray-500">登录后即可参与讨论（功能即将上线）</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Click any skill card on the homepage — detail page should open with full info.

- [ ] **Step 3: Commit**

```bash
git add src/app/skill/
git commit -m "feat: add skill detail page"
```

---

## Task 8: Search Page

**Files:**
- Create: `src/app/search/page.tsx`

- [ ] **Step 1: Write search page**

```tsx
// src/app/search/page.tsx
import { searchSkills, getCategories } from '@/lib/queries';
import SkillCard from '@/components/SkillCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const category = sp.category;
  const sort = sp.sort === 'new' ? 'new' : 'hot';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));

  const [{ skills, total }, categories] = await Promise.all([
    q ? searchSkills(q, category, sort, page) : Promise.resolve({ skills: [], total: 0 }),
    getCategories(),
  ]);

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ q, sort, page: String(p) });
    if (category) params.set('category', category);
    return `/search?${params}`;
  };

  return (
    <div>
      {/* Search header */}
      <div className="mb-6">
        <form action="/search" method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="搜索 skills..."
            className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            搜索
          </button>
        </form>
      </div>

      {q && (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-400">分类：</span>
            <Link
              href={`/search?q=${q}&sort=${sort}`}
              className={!category ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}
            >
              全部
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?q=${q}&sort=${sort}&category=${cat.slug}`}
                className={category === cat.slug ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}
              >
                {cat.name}
              </Link>
            ))}
            <span className="ml-auto text-gray-400">排序：</span>
            <Link
              href={`/search?q=${q}&sort=hot${category ? `&category=${category}` : ''}`}
              className={sort === 'hot' ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}
            >
              最热
            </Link>
            <Link
              href={`/search?q=${q}&sort=new${category ? `&category=${category}` : ''}`}
              className={sort === 'new' ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}
            >
              最新
            </Link>
          </div>

          <p className="mb-4 text-sm text-gray-400">
            「{q}」共找到 {total} 个结果
          </p>

          {skills.length === 0 ? (
            <p className="text-gray-500">没有找到相关 skills。</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}

          <Pagination page={page} total={total} buildHref={buildHref} />
        </>
      )}

      {!q && (
        <p className="text-gray-500">请在上方输入关键词搜索 skills。</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Test search in browser**

Visit http://localhost:3000/search?q=brainstorm — should show matching skills.

- [ ] **Step 3: Push to Vercel**

```bash
git add src/app/search/
git commit -m "feat: add search page with category filter"
git push origin main
```

Expected: Vercel auto-deploys, all pages accessible.

---

**Plan 2 complete.** The full browsing experience is live — homepage hot-list, category pages, skill details, and search all work. Proceed to Plan 3 to add auth, voting, and comments.
