-- Trigger functions need SECURITY DEFINER so the UPDATE against `skills` bypasses
-- RLS (skills only has a SELECT policy; UPDATE as the authenticated user matches 0 rows).
-- Also backfill any rows already inserted before this fix.

CREATE OR REPLACE FUNCTION bump_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE skills SET vote_count = vote_count + 1 WHERE id = NEW.skill_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE skills SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION bump_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE skills SET comment_count = comment_count + 1 WHERE id = NEW.skill_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE skills SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Backfill counters from existing rows (idempotent).
UPDATE skills s
SET vote_count = COALESCE(v.cnt, 0)
FROM (SELECT skill_id, COUNT(*) AS cnt FROM votes GROUP BY skill_id) v
WHERE s.id = v.skill_id;

UPDATE skills s
SET comment_count = COALESCE(c.cnt, 0)
FROM (SELECT skill_id, COUNT(*) AS cnt FROM comments GROUP BY skill_id) c
WHERE s.id = c.skill_id;
