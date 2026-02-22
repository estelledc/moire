import { describe, expect, it } from 'vitest';

import { getMemoBySlug, getMemos } from './memos';

describe('memos parser smoke tests', () => {
  it('returns normalized memo data sorted by date descending', async () => {
    const memos = await getMemos();

    expect(Array.isArray(memos)).toBe(true);

    for (const memo of memos) {
      expect(memo.slug.length).toBeGreaterThan(0);
      expect(typeof memo.content).toBe('string');
      expect(Array.isArray(memo.tags)).toBe(true);
      expect(Number.isNaN(memo.date.getTime())).toBe(false);
    }

    for (let index = 1; index < memos.length; index += 1) {
      expect(memos[index - 1].date.getTime()).toBeGreaterThanOrEqual(memos[index].date.getTime());
    }
  });

  it('resolves memo by slug when at least one memo exists', async () => {
    const memos = await getMemos();

    if (memos.length === 0) {
      return;
    }

    const targetSlug = memos[0].slug;
    const memo = await getMemoBySlug(targetSlug);

    expect(memo).not.toBeNull();
    expect(memo?.slug).toBe(targetSlug);
  });
});
