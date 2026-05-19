import { createClient } from '@/lib/supabase-server';
import type { Skill, SkillRanked, Category, Comment } from '@/types';

const PAGE_SIZE = 20;

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

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

  const base = supabase
    .from(sort === 'hot' ? 'skills_ranked' : 'skills')
    .select('*, category:categories(id,name,slug)', { count: 'exact' })
    .eq('category_id', category.id)
    .range(from, to);

  const ordered = sort === 'hot'
    ? base.order('score', { ascending: false })
    : base.order('created_at', { ascending: false });

  const { data, error, count } = await ordered;
  if (error) throw error;
  return { skills: (data ?? []) as Skill[], total: count ?? 0, category };
}

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

export async function getComments(skillId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Comment[];
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserVote(skillId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('skill_id', skillId)
    .maybeSingle();
  return !!data;
}

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
