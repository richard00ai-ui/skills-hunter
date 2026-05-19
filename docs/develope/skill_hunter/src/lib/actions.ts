'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=missing');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect('/');
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || password.length < 6) {
    redirect('/login?error=' + encodeURIComponent('Password must be at least 6 characters'));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect('/?welcome=1');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function toggleVote(skillId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('skill_id', skillId)
    .maybeSingle();

  if (existing) {
    await supabase.from('votes').delete().eq('id', existing.id);
  } else {
    await supabase.from('votes').insert({ user_id: user.id, skill_id: skillId });
  }

  revalidatePath(`/skill/${skillId}`);
  revalidatePath('/');
}

export async function postComment(skillId: string, formData: FormData) {
  const content = String(formData.get('content') ?? '').trim();
  if (!content) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  await supabase.from('comments').insert({
    user_id: user.id,
    skill_id: skillId,
    content,
  });

  revalidatePath(`/skill/${skillId}`);
}
