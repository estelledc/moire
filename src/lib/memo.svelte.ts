import { format } from 'date-fns';

type MemoItem = {
    date: Date | string;
    tags?: string[];
};

type MemoData<T extends MemoItem> = {
    memos: T[];
};

type MemoListConfig = {
    pageSize?: number;
};

export function createMemoList<T extends MemoItem>(getData: () => MemoData<T>, getConfig: () => MemoListConfig) {
    function getPageSize() {
        return getConfig().pageSize || 20;
    }

    function readTagFromUrl() {
        if (typeof window === 'undefined') {
            return null;
        }

        const tag = new URLSearchParams(window.location.search).get('tag');
        return tag && tag.length > 0 ? tag : null;
    }

    let visibleCount = $state(getPageSize());
    let selectedTag = $state<string | null>(null);
    let isUrlTagInitialized = $state(false);

    // Derived: Get all unique tags
    const allTags = $derived.by(() => {
        const tags = new Set<string>();
        getData().memos.forEach((memo) => {
            memo.tags?.forEach((t: string) => tags.add(t));
        });
        return Array.from(tags).sort();
    });

    // Derived: Filter memos by tag
    const filteredMemos = $derived(
        selectedTag !== null
            ? getData().memos.filter((memo) => memo.tags?.includes(selectedTag as string))
            : getData().memos
    );

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

    return {
        get visibleCount() { return visibleCount },
        get selectedTag() { return selectedTag },
        get allTags() { return allTags },
        get filteredMemos() { return filteredMemos },
        get visibleMemos() { return visibleMemos },
        get groupedMemos() { return groupedMemos },
        loadMore,
        selectTag
    };
}
