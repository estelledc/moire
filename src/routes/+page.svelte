<script lang="ts">
    import type { PageData } from './$types';
    import { config } from '../../moire.config';
    import ThemeComponent from '$active-theme';

    let { data }: { data: PageData } = $props();

    const schema = $derived({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": config.title,
        "description": config.description,
        "url": config.url,
        "author": {
            "@type": "Person",
            "name": config.author
        },
        "blogPost": data.memos.map(memo => ({
            "@type": "BlogPosting",
            "headline": memo.slug, // Using slug as headline since there's no title
            "datePublished": memo.date instanceof Date ? memo.date.toISOString() : memo.date,
            "url": `${config.url}/m/${memo.slug}`,
            "articleBody": memo.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...', // Strip HTML for summary
            "keywords": memo.tags.join(', ')
        }))
    });
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

<ThemeComponent {data} {config} />
