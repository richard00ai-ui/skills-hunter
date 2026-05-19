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
