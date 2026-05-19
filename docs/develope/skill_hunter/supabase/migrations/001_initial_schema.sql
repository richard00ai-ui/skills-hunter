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
  skill_id      text NOT NULL UNIQUE,
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

CREATE INDEX skills_fts_idx ON skills
  USING gin(to_tsvector('english', name || ' ' || description));

-- Hot-list view: HN-style time decay
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

CREATE POLICY "skills_select" ON skills FOR SELECT USING (true);

CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
