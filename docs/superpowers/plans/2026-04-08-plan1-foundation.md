# Skills Hunter — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Next.js project, set up Supabase schema, and build the GitHub crawler script that seeds the database.

**Architecture:** Next.js 14 App Router project with TypeScript and Tailwind. Supabase hosts PostgreSQL + Auth. A standalone Node.js script (`scripts/crawl.js`) reads `scripts/sources.json`, calls GitHub API, and upserts skills into Supabase using `skill_id` as the unique key.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), Node.js 18+ (native fetch), Jest

---

## File Map

| File | Responsibility |
|------|---------------|
| `supabase/migrations/001_initial_schema.sql` | All table/view/policy definitions |
| `src/lib/supabase-browser.ts` | Supabase client for browser components |
| `src/lib/supabase-server.ts` | Supabase client for Server Components / Route Handlers |
| `src/types/index.ts` | Shared TypeScript types (Skill, Category, Comment, Vote) |
| `scripts/sources.json` | List of GitHub repos to crawl |
| `scripts/crawl.js` | Crawler: reads sources, calls GitHub API, upserts to Supabase |
| `__tests__/crawl.test.js` | Unit tests for `parseSkillMd` |
| `.env.example` | Template for required environment variables |

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: project root (current directory)

- [ ] **Step 1: Run create-next-app**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

When prompted "Ok to proceed? (y)" → type `y`
When prompted about Turbopack → press Enter (default Yes)

- [ ] **Step 2: Verify it starts**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm run dev &
sleep 5 && curl -s http://localhost:3000 | head -5
kill %1
```

Expected: HTML output starting with `<!DOCTYPE html>`

- [ ] **Step 3: Install additional dependencies**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm install \
  @supabase/supabase-js \
  @supabase/ssr
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm install --save-dev \
  jest \
  dotenv
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
git add -A
git commit -m "feat: initialize Next.js project with Supabase deps"
```

---

## Task 2: Environment Variables

**Files:**
- Create: `.env.example`
- Create: `.env.local` (user fills in values)
- Modify: `.gitignore`

- [ ] **Step 1: Create `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_TOKEN=your-github-personal-access-token
```

- [ ] **Step 2: Create `.env.local` with real values**

Go to [supabase.com](https://supabase.com) → create a new project → Project Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (keep secret)

Go to [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → check `public_repo` scope:
- `GITHUB_TOKEN` = generated token

- [ ] **Step 3: Verify `.gitignore` includes `.env.local`**

Open `.gitignore` — confirm it contains `.env.local` (create-next-app adds this by default). Also add:

```
.superpowers/
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
git add .env.example .gitignore
git commit -m "feat: add environment variable template"
```

---

## Task 3: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write the types file**

```typescript
// src/types/index.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Skill {
  id: string;
  skill_id: string;        // {repo}/{name}, e.g. "obra/superpowers/brainstorming"
  name: string;
  repo: string;
  description: string;
  install_cmd: string;
  category_id: string | null;
  tags: string[];
  github_stars: number;
  last_updated: string;    // ISO timestamp
  created_at: string;      // ISO timestamp
  vote_count: number;
  comment_count: number;
  // Joined fields (optional, from queries)
  category?: Category;
}

export interface SkillRanked extends Skill {
  score: number;           // computed by skills_ranked view
}

export interface Vote {
  id: string;
  user_id: string;
  skill_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  skill_id: string;
  content: string;
  created_at: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npx tsc --noEmit
```

Expected: no output (no errors)

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 4: Supabase Client Libraries

**Files:**
- Create: `src/lib/supabase-browser.ts`
- Create: `src/lib/supabase-server.ts`

- [ ] **Step 1: Write browser client**

```typescript
// src/lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Write server client**

```typescript
// src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npx tsc --noEmit
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 5: Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Categories (manually maintained)
CREATE TABLE categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

INSERT INTO categories (name, slug) VALUES
  ('代码开发', 'code'),
  ('写作文档', 'writing'),
  ('设计',     'design'),
  ('研究分析', 'research'),
  ('效率工具', 'productivity'),
  ('其他',     'other');

-- Skills
CREATE TABLE skills (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id      text NOT NULL UNIQUE,          -- {repo}/{name}
  name          text NOT NULL,
  repo          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  install_cmd   text NOT NULL,
  category_id   uuid REFERENCES categories(id),
  tags          text[] NOT NULL DEFAULT '{}',
  github_stars  integer NOT NULL DEFAULT 0,
  last_updated  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  vote_count    integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0
);

-- Full-text search index (name + description)
CREATE INDEX skills_fts_idx ON skills
  USING gin(to_tsvector('english', name || ' ' || description));

-- Hot-list view: HN-style time decay score
-- score = vote_count / (age_hours + 2)^1.5
CREATE VIEW skills_ranked AS
  SELECT
    *,
    vote_count::float /
      POWER(EXTRACT(EPOCH FROM (now() - created_at)) / 3600.0 + 2, 1.5)
      AS score
  FROM skills;

-- Votes
CREATE TABLE votes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id   uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Comments
CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id   uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE skills   ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- skills: anyone can read
CREATE POLICY "skills_select" ON skills FOR SELECT USING (true);

-- votes: anyone can read; owners can insert/delete
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- comments: anyone can read; owners can insert
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Run migration on Supabase**

Go to Supabase Dashboard → SQL Editor → paste the entire contents of `001_initial_schema.sql` → click **Run**.

Expected: "Success. No rows returned"

- [ ] **Step 3: Verify tables exist**

In Supabase Dashboard → Table Editor → confirm you see: `categories`, `skills`, `votes`, `comments`. Click `categories` → confirm 6 rows are present.

- [ ] **Step 4: Commit**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
git add supabase/
git commit -m "feat: add initial database schema and migration"
```

---

## Task 6: GitHub Crawler Script

**Files:**
- Create: `scripts/sources.json`
- Create: `scripts/crawl.js`
- Create: `__tests__/crawl.test.js`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Write failing tests for `parseSkillMd`**

```javascript
// __tests__/crawl.test.js
const { parseSkillMd } = require('../scripts/crawl');

describe('parseSkillMd', () => {
  test('parses name and description from valid frontmatter', () => {
    const content = `---
name: brainstorming
description: "Turn ideas into designs through dialogue"
---

# Body content here`;
    expect(parseSkillMd(content)).toEqual({
      name: 'brainstorming',
      description: 'Turn ideas into designs through dialogue',
    });
  });

  test('parses unquoted description', () => {
    const content = `---
name: doc-coauthoring
description: Guide users through structured doc writing
---`;
    expect(parseSkillMd(content)).toEqual({
      name: 'doc-coauthoring',
      description: 'Guide users through structured doc writing',
    });
  });

  test('returns empty description when missing', () => {
    const content = `---
name: simple-skill
---`;
    expect(parseSkillMd(content)).toEqual({
      name: 'simple-skill',
      description: '',
    });
  });

  test('returns null when no frontmatter', () => {
    expect(parseSkillMd('# Just a markdown file')).toBeNull();
  });

  test('returns null when name is missing', () => {
    const content = `---
description: no name here
---`;
    expect(parseSkillMd(content)).toBeNull();
  });
});
```

- [ ] **Step 2: Add test script to `package.json`**

Open `package.json`, find the `"scripts"` section, add:

```json
"test": "node --experimental-vm-modules node_modules/.bin/jest"
```

Also add a `"jest"` config block at the top level of `package.json`:

```json
"jest": {
  "testEnvironment": "node"
}
```

- [ ] **Step 3: Run tests — confirm they fail**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/crawl.test.js 2>&1 | tail -20
```

Expected: `Cannot find module '../scripts/crawl'`

- [ ] **Step 4: Write `scripts/sources.json`**

```json
[
  "obra/superpowers",
  "anthropics/skills"
]
```

- [ ] **Step 5: Write `scripts/crawl.js`**

```javascript
// scripts/crawl.js
'use strict';

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ─── Pure helper (exported for tests) ────────────────────────────────────────

function parseSkillMd(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];

  const nameMatch = fm.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  if (!nameMatch) return null;
  const name = nameMatch[1].trim();

  // Handles both quoted: description: "foo" and unquoted: description: foo
  const descMatch = fm.match(/^description:\s*["'](.+?)["']\s*$/m)
    || fm.match(/^description:\s*(.+?)\s*$/m);
  const description = descMatch ? descMatch[1].trim() : '';

  return { name, description };
}

module.exports = { parseSkillMd };

// ─── GitHub API helper ────────────────────────────────────────────────────────

async function githubGet(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      'User-Agent': 'skills-hunter-crawler',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

// ─── Crawler ──────────────────────────────────────────────────────────────────

async function crawlRepo(supabase, repo) {
  const [owner, repoName] = repo.split('/');
  console.log(`\nCrawling ${repo}...`);

  const repoData = await githubGet(`/repos/${owner}/${repoName}`);
  const stars = repoData.stargazers_count ?? 0;
  const lastUpdated = repoData.updated_at;

  let contents;
  try {
    contents = await githubGet(`/repos/${owner}/${repoName}/contents/skills`);
  } catch {
    console.log(`  ⚠ No skills/ directory found`);
    return;
  }

  const dirs = contents.filter((item) => item.type === 'dir');
  console.log(`  Found ${dirs.length} skill directories`);

  for (const dir of dirs) {
    try {
      const fileData = await githubGet(
        `/repos/${owner}/${repoName}/contents/skills/${dir.name}/SKILL.md`
      );
      const mdContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      const parsed = parseSkillMd(mdContent);

      if (!parsed) {
        console.log(`  ⚠ ${dir.name}: could not parse SKILL.md`);
        continue;
      }

      const record = {
        skill_id: `${repo}/${parsed.name}`,
        name: parsed.name,
        repo,
        description: parsed.description,
        install_cmd: `npx skills add ${repo}`,
        tags: [],
        github_stars: stars,
        last_updated: lastUpdated,
      };

      const { error } = await supabase
        .from('skills')
        .upsert(record, { onConflict: 'skill_id' });

      if (error) {
        console.error(`  ✗ ${record.skill_id}: ${error.message}`);
      } else {
        console.log(`  ✓ ${record.skill_id}`);
      }
    } catch (e) {
      console.log(`  ⚠ ${dir.name}: ${e.message}`);
    }
  }
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const sources = require('./sources.json');
  console.log(`Starting crawl of ${sources.length} repos...`);

  for (const repo of sources) {
    await crawlRepo(supabase, repo);
  }

  console.log('\nCrawl complete!');
}

// Only run when executed directly (not when required by tests)
if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 6: Run tests — confirm they pass**

```bash
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" npm test -- __tests__/crawl.test.js
```

Expected output:
```
PASS  __tests__/crawl.test.js
  parseSkillMd
    ✓ parses name and description from valid frontmatter
    ✓ parses unquoted description
    ✓ returns empty description when missing
    ✓ returns null when no frontmatter
    ✓ returns null when name is missing

Tests: 5 passed, 5 total
```

- [ ] **Step 7: Commit**

```bash
git add scripts/ __tests__/ package.json
git commit -m "feat: add GitHub crawler with unit tests"
```

---

## Task 7: Seed the Database

**Files:** none (runtime operation)

- [ ] **Step 1: Run the crawler**

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@25/bin:$PATH" node scripts/crawl.js
```

Expected output (example):
```
Starting crawl of 2 repos...

Crawling obra/superpowers...
  Found 14 skill directories
  ✓ obra/superpowers/brainstorming
  ✓ obra/superpowers/writing-plans
  ... (12 more)

Crawling anthropics/skills...
  Found 18 skill directories
  ✓ anthropics/skills/doc-coauthoring
  ... (17 more)

Crawl complete!
```

- [ ] **Step 2: Verify data in Supabase**

Go to Supabase Dashboard → Table Editor → `skills` → confirm rows are present with names, descriptions, and `install_cmd` values.

---

## Task 8: Initial Vercel Deployment

**Files:** none (Vercel configuration)

- [ ] **Step 1: Push code to GitHub**

Go to [github.com/new](https://github.com/new) → create a new **private** repo named `skills-hunter`.

```bash
cd "/Users/xiaolongxia/Desktop/Skills hunter"
git remote add origin https://github.com/YOUR_USERNAME/skills-hunter.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

Go to [vercel.com/new](https://vercel.com/new) → Import the `skills-hunter` GitHub repo → click **Deploy** (default settings are fine for now).

- [ ] **Step 3: Add environment variables to Vercel**

In Vercel project → Settings → Environment Variables → add all four from `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`

- [ ] **Step 4: Redeploy**

In Vercel → Deployments → click the three dots on the latest deployment → **Redeploy**.

Expected: deployment succeeds, visiting the Vercel URL shows the default Next.js starter page.

---

**Plan 1 complete.** The project is initialized, the database is seeded with real skill data, and the app is live on Vercel. Proceed to Plan 2 to build the UI.
