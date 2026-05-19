'use strict';

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

function parseSkillMd(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];

  const nameMatch = fm.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  if (!nameMatch) return null;
  const name = nameMatch[1].trim();

  const descMatch = fm.match(/^description:\s*["'](.+?)["']\s*$/m)
    || fm.match(/^description:\s*(.+?)\s*$/m);
  const description = descMatch ? descMatch[1].trim() : '';

  return { name, description };
}

module.exports = { parseSkillMd };

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

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
