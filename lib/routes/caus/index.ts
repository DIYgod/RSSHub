import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

// Reason: preserve original category numbers for backward compatibility.
// WordPress category ids from REST API (GET /wp-json/wp/v2/categories).
// Old categories "商业"(2) and "快讯"(3) no longer exist on the new site,
// mapped to closest equivalents: 2→财富(finance), 3→社会(lifestyle).
const categories = {
    0: { title: '全部', slug: '', id: 0 },
    1: { title: '要闻', slug: 'news', id: 101 },
    2: { title: '商业', slug: 'finance', id: 108 },
    3: { title: '快讯', slug: 'lifestyle', id: 106 },
    8: { title: '财富', slug: 'finance', id: 108 },
    6: { title: '生活', slug: 'lifestyle', id: 106 },
};

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/caus',
    parameters: { category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 全部 | 要闻 | 商业 | 快讯 | 财富 | 生活 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 2    | 3    | 8    | 6    |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || '0';
    const cat = categories[category] || categories[0];

    const rootUrl = 'https://caus.com';
    const apiUrl = `${rootUrl}/wp-json/wp/v2/posts`;

    const query: Record<string, string | number> = {
        per_page: 20,
        // Reason: using _embed=1 with many posts produces responses too large for ofetch to parse as JSON
        _embed: 'author,wp:term',
    };
    if (cat.id) {
        query.categories = cat.id;
    }

    const data = await ofetch(apiUrl, { query });

    const items = data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        author: item._embedded?.author?.[0]?.name,
        category: item._embedded?.['wp:term']?.[0]?.map((t) => t.name),
    }));

    const currentUrl = cat.slug ? `${rootUrl}/category/${cat.slug}/` : rootUrl;

    return {
        title: `${cat.title} - 加美财经`,
        link: currentUrl,
        item: items,
    };
}
