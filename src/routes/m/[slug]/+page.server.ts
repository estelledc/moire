import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

import { getMemoBySlug, getMemos } from '$lib/server/memos';

export const prerender = true;

export const entries: EntryGenerator = async () => {
  const memos = await getMemos();

  return memos.map((memo) => ({ slug: memo.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const memo = await getMemoBySlug(params.slug);

  if (!memo) {
    throw error(404, 'Memo not found');
  }

  return {
    memo
  };
};
