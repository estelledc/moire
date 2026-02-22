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

    let visibleCount = $state(getPageSize());
    let selectedTag = $state<string | null>(null);

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
