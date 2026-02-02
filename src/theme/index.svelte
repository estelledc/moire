<script lang="ts">
    import { format } from 'date-fns';
    import avatar from './assets/avatar.png';
    import './global.css';
    import type { PageData } from '../routes/$types';
    
    // Theme Interface
    let { data, config }: { data: PageData, config: any } = $props();

    // Pagination State
    let visibleCount = $state(config.pageSize || 20);
    let selectedTag = $state<string | null>(null);

    // Derived: Get all unique tags
    const allTags = $derived.by(() => {
        const tags = new Set<string>();
        data.memos.forEach(memo => {
            memo.tags?.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    });

    // Derived: Filter memos by tag
    const filteredMemos = $derived(
        selectedTag !== null
            ? data.memos.filter(memo => memo.tags?.includes(selectedTag as string))
            : data.memos
    );
    
    // Derived: Slice the memos first
    const visibleMemos = $derived(filteredMemos.slice(0, visibleCount));

    // Group memos by Date (YYYY-MM-DD)
    const groupedMemos = $derived.by(() => {
        const groups: Record<string, typeof data.memos> = {};
        visibleMemos.forEach(memo => {
            const dateKey = format(memo.date, 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(memo);
        });
        return groups;
    });

    function loadMore() {
        visibleCount += (config.pageSize || 20);
    }
</script>

<div class="receipt-container {config.theme}">
    <div class="receipt">
        <header class="receipt-header">
            <div class="logo">{config.title.toUpperCase()}</div>
            <div class="meta">
                <p>STORE: 001</p>
                <p>CASHIER: {config.author.toUpperCase()}</p>
                <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div class="divider">================================</div>
            
            {#if selectedTag}
                <div class="tags-section">
                    <div class="tags-label">
                        FILTERING BY: <button class="tag-btn active" onclick={() => selectedTag = null}>#{selectedTag}</button>
                    </div>
                    <div class="divider">--------------------------------</div>
                </div>
            {/if}
        </header>

        <div class="receipt-body" onclick={(e) => {
            const target = (e.target as HTMLElement).closest('.memo-tag');
            if (target) {
                const tag = (target as HTMLElement).dataset.tag;
                if (tag) selectedTag = selectedTag === tag ? null : tag;
            }
        }} role="presentation">
            {#each Object.entries(groupedMemos) as [dateKey, memos]}
                <div class="date-group">
                    <div class="date-header">
                        <span>*** {format(new Date(dateKey), 'MMM dd, yyyy').toUpperCase()} ***</span>
                    </div>
                    
                    {#each memos as memo}
                        <div class="log-item">
                            <div class="log-meta">
                                <span class="time">{format(memo.date, 'HH:mm')}</span>
                                <div class="avatar">
                                    <img src={avatar} alt="User" onerror={(e) => (e.currentTarget as HTMLImageElement).style.display='none'}/>
                                </div>
                            </div>
                            <div class="content">
                                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                {@html memo.content}
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}

            {#if data.memos.length === 0}
                <div class="empty-state">
                    <p>NO DATA.</p>
                </div>
            {/if}

            {#if visibleCount < data.memos.length}
                <div class="load-more-container">
                    <button class="load-more-btn" onclick={loadMore}>[ PRINT MORE... ]</button>
                </div>
            {/if}
        </div>

        <footer class="receipt-footer">
            <div class="divider">================================</div>
            <p>TOTAL ITEMS: {data.memos.length}</p>
            <p>THANK YOU FOR VISITING</p>
            
            <div class="barcode">
                ||||| |||| || | ||||| || |
            </div>
            
            <div class="cut-line">
                - - - - - - - - - - - - - - - 
            </div>
            
        </footer>
    </div>
</div>

<style>
    /* Moved from +page.svelte */
    .receipt-container {
        display: flex;
        justify-content: center;
        padding: 40px 20px;
        min-height: 100vh;
    }

    .receipt {
        width: 100%;
        max-width: 380px;
        background: var(--receipt-bg);
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        position: relative;
        filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1));
        /* Removed complex mask to fix visibility issues */
        border-top: 1px dashed #ccc;
        border-bottom: 1px dashed #ccc;
    }

    .receipt-header {
        text-align: center;
        margin-bottom: 20px;
    }

    .logo {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: 2px;
        margin-bottom: 10px;
    }

    .meta {
        font-size: 0.8rem;
        text-transform: uppercase;
        margin-bottom: 10px;
    }

    .divider {
        font-weight: 700;
        overflow: hidden;
        white-space: nowrap;
        margin: 10px 0;
    }

    .tags-section {
        margin-bottom: 20px;
        text-align: center;
    }

    .tags-label {
        font-size: 0.75rem;
        font-weight: bold;
        margin-bottom: 8px;
    }

    /* .memo-tag is injected into the HTML content */
    :global(.memo-tag) {
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
        font-size: inherit;
        font-weight: bold;
        color: #000;
        cursor: pointer;
        text-decoration: underline;
        transition: color 0.2s;
    }
    
    :global(.memo-tag:hover) {
        color: #666;
    }

    .tag-btn {
        background: none;
        border: 1px solid #000;
        padding: 2px 4px;
        font-size: 0.75rem;
        cursor: pointer;
        font-family: inherit;
        text-transform: uppercase;
        transition: all 0.2s;
        display: inline-block;
    }

    .tag-btn:hover, .tag-btn.active {
        color: black;
    }

    .date-group {
        margin-bottom: 30px;
    }

    .date-header {
        text-align: center;
        margin-bottom: 15px;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .log-item {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        align-items: flex-start;
    }

    .log-meta {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 40px;
        flex-shrink: 0;
    }

    .time {
        font-size: 0.75rem;
        font-weight: bold;
    }

    .avatar {
        width: 32px;
        height: 32px;
        background: #000;
        border-radius: 50%;
        overflow: hidden;
    }
    
    .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .content {
        flex: 1;
        font-size: 0.95rem;
    }

    /* Initial Reset for markdown content to fit receipt style */
    .content :global(h1), 
    .content :global(h2), 
    .content :global(h3) {
        font-size: 1rem;
        margin: 0 0 5px 0;
        text-transform: uppercase;
    }

    .content :global(p) {
        margin: 0 0 10px 0;
    }
    
    .content :global(ul), .content :global(ol) {
        padding-left: 15px;
        margin: 0 0 10px 0;
    }

    .content :global(img) {
        filter: grayscale(100%) contrast(120%); /* B&W photo look */
        max-width: 100%;
        margin: 5px 0;
        border: 2px solid #000;
    }

    .receipt-footer {
        text-align: center;
        margin-top: 40px;
        font-size: 0.8rem;
    }

    .barcode {
        font-family: 'Libre Barcode 39', cursive; /* Fallback to dashes if font load fails */
        font-size: 2rem;
        margin: 20px 0;
        letter-spacing: 5px;
    }
    
    .cut-line {
        margin: 20px 0;
        color: #999;
    }

    .load-more-container {
        text-align: center;
        margin: 20px 0;
    }

    .load-more-btn {
        background: none;
        border: 2px dashed #000;
        padding: 5px 15px;
        font-family: inherit;
        font-size: 0.8rem;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
    }
    
    .load-more-btn:hover {
        background: #000;
        color: #fff;
    }
</style>
