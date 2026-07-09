import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const siteUrl = 'https://www.baai.ac.cn';
const apiUrl = `${siteUrl}/api/news`;

export const route: Route = {
    path: '/news/:category?',
    categories: ['programming'],
    example: '/baai/news',
    parameters: {
        category: {
            description: '分类，可选 `news`（新闻）或 `media`（媒体报道），默认返回全部',
            options: [
                { value: 'news', label: '新闻' },
                { value: 'media', label: '媒体报道' },
            ],
        },
    },
    radar: [
        {
            source: ['www.baai.ac.cn/news', 'www.baai.ac.cn/'],
            target: '/news',
        },
    ],
    name: '智源官网 - 新闻',
    maintainers: ['lisyer'],
    url: 'www.baai.ac.cn/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 200;

    const data = await ofetch(apiUrl, {
        query: {
            size: limit,
        },
    });

    let items = data.items ?? [];
    if (category) {
        items = items.filter((item) => item.category === category);
    }

    const feedItems = items
        .filter((item) => item.is_published !== false)
        .map((item) => {
            const image = item.image_url ? new URL(item.image_url, siteUrl).href : undefined;
            const descriptionParts: string[] = [];
            if (image) {
                descriptionParts.push(`<img src="${image}" />`);
            }
            if (item.description) {
                descriptionParts.push(item.description);
            }

            return {
                title: item.title,
                link: item.source_url || `${siteUrl}/news`,
                description: descriptionParts.join('<br>') || undefined,
                pubDate: item.published_at ? parseDate(item.published_at) : undefined,
                category: item.category ? [item.category] : undefined,
                guid: item.id,
                image,
            };
        });

    const categoryLabel = category === 'media' ? '媒体报道' : '新闻';

    return {
        title: `北京智源人工智能研究院 - ${categoryLabel}`,
        link: `${siteUrl}/news`,
        description: '北京智源人工智能研究院官网新闻与媒体报道',
        language: 'zh-cn',
        item: feedItems,
    };
}
