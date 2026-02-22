<script lang="ts">
  import { format } from 'date-fns';
  import type { PageData } from './$types';

  import { config } from '../../../../moire.config';

  let { data }: { data: PageData } = $props();

  const baseUrl = config.url.replace(/\/$/, '');
  const canonicalUrl = $derived(`${baseUrl}/m/${data.memo.slug}`);
  const plainText = $derived(data.memo.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  const description = $derived(plainText.slice(0, 160));
</script>

<svelte:head>
  <title>{config.title} | {format(new Date(data.memo.date), 'yyyy-MM-dd HH:mm')}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:type" content="article" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={`${config.title} | ${data.memo.slug}`} />
  <meta property="og:description" content={description} />

  <meta property="twitter:card" content="summary" />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta property="twitter:title" content={`${config.title} | ${data.memo.slug}`} />
  <meta property="twitter:description" content={description} />
</svelte:head>

<main class="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
  <a
    href="/"
    class="inline-flex items-center rounded-full border border-[var(--bento-pill-border)] bg-[var(--bento-pill-bg)] px-4 py-2 text-sm font-semibold text-[var(--bento-pill-text)] no-underline transition hover:bg-[var(--bento-pill-bg-hover)]"
  >
    Back to timeline
  </a>

  <article
    class="mt-6 rounded-3xl border border-[var(--bento-card-border)] bg-[var(--bento-card-bg)] p-6 shadow-sm backdrop-blur md:p-8"
  >
    <header class="mb-6 border-b border-[var(--bento-table-row-border)] pb-4">
      <p class="text-xs font-semibold uppercase tracking-widest text-[var(--bento-meta)]">
        {format(new Date(data.memo.date), 'MMMM d, yyyy HH:mm')}
      </p>
      <h1 class="mt-2 text-xl font-bold tracking-tight text-[var(--bento-title)]">Memo {data.memo.slug}</h1>

      {#if data.memo.tags.length > 0}
        <div class="mt-4 flex flex-wrap gap-2">
          {#each data.memo.tags as tag}
            <a
              href={`/?tag=${encodeURIComponent(tag)}`}
              class="rounded-full bg-[var(--bento-tag-bg)] px-3 py-1 text-xs font-medium text-[var(--bento-tag-text)] no-underline transition hover:bg-[var(--bento-tag-bg-hover)] hover:text-[var(--bento-tag-text-hover)]"
            >
              #{tag}
            </a>
          {/each}
        </div>
      {/if}
    </header>

    <div
      class="text-[0.98rem] tracking-wide text-[var(--bento-body)]
             [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-[1.3rem] [&_h1]:font-bold [&_h1]:text-[var(--bento-heading)]
             [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-[1.2rem] [&_h2]:font-semibold [&_h2]:text-[var(--bento-heading)]
             [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-[1.05rem] [&_h3]:font-semibold [&_h3]:text-[var(--bento-heading)]
             [&_p]:my-4
             [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
             [&_li]:my-1
             [&_a]:text-[var(--bento-link)] [&_a]:underline [&_a]:underline-offset-2
             [&_code]:rounded-md [&_code]:bg-[var(--bento-code-bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[var(--bento-code-text)]
             [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--bento-pre-border)] [&_pre]:bg-[var(--bento-pre-bg)] [&_pre]:p-4
             [&_blockquote]:my-4 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--bento-blockquote-border)] [&_blockquote]:bg-[var(--bento-blockquote-bg)] [&_blockquote]:pl-4 [&_blockquote]:py-2"
    >
      {@html data.memo.content}
    </div>
  </article>
</main>
