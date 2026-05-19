export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Skill {
  id: string;
  skill_id: string;
  name: string;
  repo: string;
  description: string;
  install_cmd: string;
  category_id: string | null;
  tags: string[];
  github_stars: number;
  last_updated: string | null;
  created_at: string;
  vote_count: number;
  comment_count: number;
  category?: Category;
}

export interface SkillRanked extends Skill {
  score: number;
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
