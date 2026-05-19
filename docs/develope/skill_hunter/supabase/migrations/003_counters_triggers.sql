-- Keep skills.vote_count and skills.comment_count in sync with votes / comments tables.

CREATE OR REPLACE FUNCTION bump_vote_count()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_count_trigger ON votes;
CREATE TRIGGER votes_count_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION bump_vote_count();

CREATE OR REPLACE FUNCTION bump_comment_count()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_count_trigger ON comments;
CREATE TRIGGER comments_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION bump_comment_count();
