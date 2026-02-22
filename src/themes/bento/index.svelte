<script lang="ts">
  import { slide } from 'svelte/transition';
  import {format} from 'date-fns';
  import {config} from '../../../moire.config';
  import {createMemoList} from '$lib/memo.svelte';
  import type {PageData} from '../../routes/$types';
  import {marked} from 'marked';

  let {data}: {data: PageData} = $props();
  const memoList = createMemoList(() => data, () => config);

  $effect(() => {
    if (memoList.selectedTag) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function handleMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--x', `${x}px`);
    target.style.setProperty('--y', `${y}px`);
  }
</script>

<div class="fixed inset-0 -z-50 h-full w-full bg-[var(--bento-page-bg)]"
     style="background-image: radial-gradient(at 0% 0%, var(--bento-grad-a) 0px, transparent 30%),
      radial-gradient(at 100% 0%, var(--bento-grad-b) 0px, transparent 30%),
      radial-gradient(at 100% 100%, var(--bento-grad-c) 0px, transparent 30%),
      radial-gradient(at 0% 100%, var(--bento-grad-d) 0px, transparent 30%);">
</div>

<div class="min-h-screen py-8 max-w-2xl mx-auto {config.theme} font-sans">
  <header class="mx-auto mb-8 md:mb-16 px-4">
    <h1 class="mb-3 text-4xl font-bold tracking-tight text-[var(--bento-title)]">{config.title}</h1>
    <p class="text-[var(--bento-muted)]">{config.description}</p>

    <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
      <label class="sr-only" for="memo-search">Search memos</label>
      <input
        id="memo-search"
        type="search"
        placeholder="Search by content or tag"
        value={memoList.searchQuery}
        oninput={(e) => memoList.setSearchQuery((e.currentTarget as HTMLInputElement).value)}
        class="w-full rounded-xl border border-[var(--bento-pill-border)] bg-[var(--bento-card-bg)] px-4 py-2 text-sm text-[var(--bento-body)] outline-none backdrop-blur transition-all placeholder:text-[var(--bento-subtle)] focus:border-[var(--bento-active-border)] focus:ring-2 focus:ring-[var(--bento-active-bg)]"
      />
      {#if memoList.searchQuery}
        <button
          onclick={memoList.clearSearchQuery}
          class="rounded-xl border border-[var(--bento-pill-border)] bg-[var(--bento-pill-bg)] px-4 py-2 text-sm font-semibold text-[var(--bento-pill-text)] transition-all hover:bg-[var(--bento-pill-bg-hover)]"
        >
          Clear
        </button>
      {/if}
    </div>

    <p class="mt-2 text-xs tracking-wide text-[var(--bento-subtle)]">
      {memoList.filteredMemos.length} result{memoList.filteredMemos.length === 1 ? '' : 's'}
    </p>
    
    {#if memoList.selectedTag || memoList.searchQuery}
      <div class="mt-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <span class="text-xs font-bold uppercase tracking-widest text-[var(--bento-subtle)]">Filters:</span>
        {#if memoList.selectedTag}
          <button
            onclick={() => memoList.selectTag(null)}
            class="group flex items-center gap-2 rounded-full border border-[var(--bento-pill-border)] bg-[var(--bento-pill-bg)] px-4 py-1.5 text-sm font-semibold italic text-[var(--bento-pill-text)] transition-all hover:bg-[var(--bento-pill-bg-hover)]"
          >
            #{memoList.selectedTag}
            <span class="text-[var(--bento-pill-text)] transition-colors group-hover:text-[var(--bento-title)]">✕</span>
          </button>
        {/if}
        {#if memoList.searchQuery}
          <button
            onclick={memoList.clearSearchQuery}
            class="group flex items-center gap-2 rounded-full border border-[var(--bento-pill-border)] bg-[var(--bento-pill-bg)] px-4 py-1.5 text-sm font-semibold italic text-[var(--bento-pill-text)] transition-all hover:bg-[var(--bento-pill-bg-hover)]"
          >
            "{memoList.searchQuery}"
            <span class="text-[var(--bento-pill-text)] transition-colors group-hover:text-[var(--bento-title)]">✕</span>
          </button>
        {/if}
      </div>
    {/if}
  </header>

  <div class="mx-auto grid grid-cols-1 gap-6 px-4 2xl:grid-cols-2" data-selected-tag={memoList.selectedTag}>
    {#each memoList.visibleMemos as memo, i (memo.slug)}
      <div
        class="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--bento-card-border)] bg-[var(--bento-card-bg)] p-3 shadow-sm backdrop-blur-3xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-8 md:rounded-[2rem] md:p-7 duration-700"
        in:slide
        onmousemove={handleMouseMove}
        id={memo.slug}
        style="--x: 50%; --y: 50%; animation-delay: {(i % 15) * 100}ms; animation-fill-mode: both;"
      >
        <div
          class="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style="background: radial-gradient(800px circle at var(--x) var(--y), var(--bento-card-spotlight), transparent 50%);"
        ></div>
        <div class="relative z-10 flex h-full flex-col">
          <div
            class="mb-6 text-[0.95rem] tracking-wide
                   [&_h1]:text-[1.25rem] [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-[var(--bento-heading)]
                   [&_h2]:text-[1.15rem]  [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[var(--bento-heading)]
                   [&_h3]:text-[1.05rem] [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-[var(--bento-heading)]
                   [&_h4]:text-[0.95rem] [&_h4]:font-semibold [&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:text-[var(--bento-heading)]
                   [&_h5]:text-[0.85rem] [&_h5]:font-medium [&_h5]:italic [&_h5]:mb-1 [&_h5]:text-[var(--bento-heading)]
                   [&_p]:my-4 [&_p]:text-[var(--bento-body)] tracking-wider 
                   [&_ul]:list-disc [&_ul]:pl-5
                   [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-4
                   [&_li]:text-[var(--bento-body)] [&_li]:my-1
                   [&_li::marker]:text-[var(--bento-marker)]
                   [&_a]:text-[var(--bento-link)] [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2 [&_a]:hover:bg-[var(--bento-link-hover-bg)]
                   [&_strong]:text-[var(--bento-strong)]
                   [&_table]:w-full [&_table]:border-collapse [&_table]:my-5 [&_table]:text-sm
                   [&_th]:border-b-2 [&_th]:border-[var(--bento-table-head-border)] [&_th]:border-dashed [&_th]:text-center [&_th]:py-1 [&_th]:font-semibold [&_th]:text-[var(--bento-heading)]
                   [&_td]:py-1 [&_td]:px-1 [&_td]:border-b [&_td]:border-[var(--bento-table-row-border)] [&_td]:border-dashed [&_td]:text-[var(--bento-body)] [&_td]:text-center
                   [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--bento-blockquote-border)] [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote_p]:my-1 [&_blockquote]:text-[var(--bento-body)] [&_blockquote]:bg-[var(--bento-blockquote-bg)] [&_blockquote]:rounded-r-lg
                   [&_code]:text-[0.85rem] [&_code]:bg-[var(--bento-code-bg)] [&_code]:text-[var(--bento-code-text)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono
                   [&_pre]:bg-[var(--bento-pre-bg)] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--bento-pre-border)] [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm
                   [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[var(--bento-code-text)]
                   [&_.tag-link]:rounded-full [&_.tag-link]:px-3 [&_.tag-link]:py-1 [&_.tag-link]:text-xs [&_.tag-link]:font-medium [&_.tag-link]:tracking-wide [&_.tag-link]:transition-all [&_.tag-link]:bg-[var(--bento-tag-bg)] [&_.tag-link]:text-[var(--bento-tag-text)] [&_.tag-link]:no-underline [&_.tag-link]:mx-0.5 [&_.tag-link:hover]:bg-[var(--bento-tag-bg-hover)] [&_.tag-link:hover]:text-[var(--bento-tag-text-hover)]"
              onclick={(e: MouseEvent) => {
                const target = (e.target as HTMLElement).closest('.tag-link') as HTMLElement | null;
                if (target) {
                    e.stopPropagation(); 
                    const tag = target.dataset.tag;
                    if (tag) memoList.selectTag(tag);
                }
             }}
          >
            {@html marked.parse(memo.content)}
          </div>

          <div
            class="mt-auto flex items-center justify-between pt-4 text-xs font-semibold tracking-wide text-[var(--bento-meta)] uppercase"
          >
            <span>{format(new Date(memo.date), 'MMM d, yyyy')}</span>
            <a
              href={`/m/${memo.slug}`}
              class="rounded-full border border-[var(--bento-pill-border)] bg-[var(--bento-pill-bg)] px-3 py-1 text-[10px] tracking-wider text-[var(--bento-pill-text)] no-underline transition-all hover:bg-[var(--bento-pill-bg-hover)]"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if memoList.filteredMemos.length === 0}
    <div class="mt-8 px-4 text-center text-sm text-[var(--bento-muted)]">
      No memos match the current filters.
    </div>
  {/if}

  {#if memoList.visibleMemos.length < memoList.filteredMemos.length}
    <div class="mt-16 flex justify-center pb-16">
      <button
        onclick={memoList.loadMore}
        class="rounded-full bg-[var(--bento-load-bg)] px-8 py-3 text-sm font-semibold text-[var(--bento-load-text)] backdrop-blur-md transition-all hover:bg-[var(--bento-load-bg-hover)] hover:text-[var(--bento-load-text-hover)] hover:shadow-lg"
      >
        Load More
      </button>
    </div>
  {/if}
  <footer class="mt-20 text-center text-xs mx-5 tracking-wide text-[var(--bento-footer)] opacity-80">
    <p>© {new Date().getFullYear()} {config.author}, synced from Apple Notes and powered by <a href="https://moire.blog/" target="_blank" class="transition-colors hover:text-[var(--bento-title)]">Moire</a></p>
  </footer>
</div>

<style>
  :global(body.bento) {
    background-color: var(--bento-page-bg);
  }

  [data-selected-tag] :global(.tag-link) {
      transition: all 0.2s ease;
  }

  /* When a tag is selected, dim other tags and highlight the active one */
  [data-selected-tag]:not([data-selected-tag="null"]) :global(.tag-link) {
      opacity: 0.5;
  }

  [data-selected-tag]:not([data-selected-tag="null"]) :global(.tag-link.active) {
      opacity: 1 !important;
      background-color: var(--bento-active-bg) !important;
      color: var(--bento-active-text) !important;
      border-color: var(--bento-active-border) !important;
      font-weight: 700 !important;
  }
</style>
