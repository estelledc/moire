import { format } from 'date-fns';

type MemoItem = {
    date: Date | string;
    tags?: string[];
    slug?: string;
    content?: string;
};

type MemoData<T extends MemoItem> = {
    memos: T[];
};

type MemoListConfig = {
    pageSize?: number;
    previewCharacterLimit?: number;
};

export function createMemoList<T extends MemoItem>(getData: () => MemoData<T>, getConfig: () => MemoListConfig) {
    function getPageSize() {
        return getConfig().pageSize || 20;
    }

    function getPreviewCharacterLimit() {
        return getConfig().previewCharacterLimit || 500;
    }

    function readTagFromUrl() {
        if (typeof window === 'undefined') {
            return null;
        }

        const tag = new URLSearchParams(window.location.search).get('tag');
        return tag && tag.length > 0 ? tag : null;
    }

    function readSearchQueryFromUrl() {
        if (typeof window === 'undefined') {
            return '';
        }

        const query = new URLSearchParams(window.location.search).get('q');
        return query && query.length > 0 ? query : '';
    }

    function getMemoSearchText(memo: T) {
        const slug = memo.slug || '';
        const tags = memo.tags?.join(' ') || '';
        const content = (memo.content || '').replace(/<[^>]*>/g, ' ');

        return `${slug} ${tags} ${content}`.toLowerCase();
    }

    function getMemoPlainText(memo: T) {
        return (memo.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    let visibleCount = $state(getPageSize());
    let selectedTag = $state<string | null>(null);
    let searchQuery = $state('');
    let isUrlTagInitialized = $state(false);
    let expandedMemoSlugs = $state(new Set<string>());

    // Derived: Get all unique tags
    const allTags = $derived.by(() => {
        const tags = new Set<string>();
        getData().memos.forEach((memo) => {
            memo.tags?.forEach((t: string) => tags.add(t));
        });
        return Array.from(tags).sort();
    });

    // Derived: Filter memos by tag
    const normalizedSearchQuery = $derived(searchQuery.trim().toLowerCase());

    const filteredMemos = $derived.by(() => {
        const currentTag = selectedTag;
        const currentQuery = normalizedSearchQuery;

        return getData().memos.filter((memo) => {
            const matchesTag = currentTag === null || memo.tags?.includes(currentTag);

            if (!matchesTag) {
                return false;
            }

            if (!currentQuery) {
                return true;
            }

            return getMemoSearchText(memo).includes(currentQuery);
        });
    });

    // Derived: Slice the memos first
    const visibleMemos = $derived(filteredMemos.slice(0, visibleCount));

    // Group memos by Date (YYYY-MM-DD)
    const groupedMemos = $derived.by(() => {
        const groups: Record<string, T[]> = {};
        visibleMemos.forEach((memo) => {
            const dateKey = format(new Date(memo.date), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(memo);
        });
        return groups;
    });

    function syncActiveTagLinkState() {
        if (typeof document === 'undefined') {
            return;
        }

        const links = document.querySelectorAll<HTMLElement>('.tag-link');

        links.forEach((link) => {
            const isActive = selectedTag !== null && link.dataset.tag === selectedTag;
            link.classList.toggle('active', isActive);
        });
    }

    $effect(() => {
        selectedTag;
        visibleMemos.length;

        queueMicrotask(syncActiveTagLinkState);
    });

    $effect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const syncSelectedTagFromUrl = () => {
            selectedTag = readTagFromUrl();
            searchQuery = readSearchQueryFromUrl();
            visibleCount = getPageSize();
        };

        syncSelectedTagFromUrl();
        isUrlTagInitialized = true;

        window.addEventListener('popstate', syncSelectedTagFromUrl);

        return () => {
            window.removeEventListener('popstate', syncSelectedTagFromUrl);
        };
    });

    $effect(() => {
        if (typeof window === 'undefined' || !isUrlTagInitialized) {
            return;
        }

        const currentUrl = new URL(window.location.href);

        if (selectedTag) {
            currentUrl.searchParams.set('tag', selectedTag);
        } else {
            currentUrl.searchParams.delete('tag');
        }

        const normalizedQuery = searchQuery.trim();

        if (normalizedQuery) {
            currentUrl.searchParams.set('q', normalizedQuery);
        } else {
            currentUrl.searchParams.delete('q');
        }

        const nextQuery = currentUrl.searchParams.toString();
        const nextUrl = `${currentUrl.pathname}${nextQuery ? `?${nextQuery}` : ''}${currentUrl.hash}`;
        const existingUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (nextUrl !== existingUrl) {
            window.history.replaceState(window.history.state, '', nextUrl);
        }
    });

    function loadMore() {
        visibleCount += getPageSize();
    }

    function selectTag(tag: string | null) {
        selectedTag = selectedTag === tag ? null : tag;
        visibleCount = getPageSize();
    }

    function setSearchQuery(query: string) {
        searchQuery = query;
        visibleCount = getPageSize();
    }

    function clearSearchQuery() {
        if (searchQuery.length === 0) {
            return;
        }

        searchQuery = '';
        visibleCount = getPageSize();
    }

    function isMemoLong(memo: T) {
        return getMemoPlainText(memo).length > getPreviewCharacterLimit();
    }

    function isMemoExpanded(slug: string | undefined) {
        if (!slug) {
            return false;
        }

        return expandedMemoSlugs.has(slug);
    }

    function shouldClampMemo(memo: T) {
        return isMemoLong(memo) && !isMemoExpanded(memo.slug);
    }

    function toggleMemoExpansion(slug: string | undefined) {
        if (!slug) {
            return;
        }

        const nextExpandedMemoSlugs = new Set(expandedMemoSlugs);

        if (nextExpandedMemoSlugs.has(slug)) {
            nextExpandedMemoSlugs.delete(slug);
        } else {
            nextExpandedMemoSlugs.add(slug);
        }

        expandedMemoSlugs = nextExpandedMemoSlugs;
    }

    return {
        get visibleCount() { return visibleCount },
        get selectedTag() { return selectedTag },
        get searchQuery() { return searchQuery },
        get allTags() { return allTags },
        get filteredMemos() { return filteredMemos },
        get visibleMemos() { return visibleMemos },
        get groupedMemos() { return groupedMemos },
        isMemoLong,
        isMemoExpanded,
        shouldClampMemo,
        toggleMemoExpansion,
        loadMore,
        selectTag,
        setSearchQuery,
        clearSearchQuery
    };
}
