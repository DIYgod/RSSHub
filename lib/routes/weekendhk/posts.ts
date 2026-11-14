import type { Language, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    example: '/weekendhk',
    radar: [
        {
            source: ['weekendhk.com/'],
        },
    ],
    name: '最新文章',
    maintainers: ['TonyRL'],
    handler,
    url: 'weekendhk.com/',
};

async function handler(ctx) {
    const baseUrl = 'https://www.weekendhk.com';
    const feed = await parser.parseURL(`${baseUrl}/feed/`);

    const items = feed.items
        .slice(0, Math.min(getRouteLimit(ctx, 100), 100))
        .map((item) => ({
            title: item.title ?? '',
            link: item.link,
            guid: item.guid,
            description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            author: item.creator ?? item.author,
            category: item.categories,
        }))
        .filter((item) => item.title);

    return {
        title: '新假期周刊',
        description: '新假期周刊網站為全港最強吃喝玩樂搵節目平台。網羅世界各地最詳盡旅遊潮流資訊；最新鮮熱辣本地飲食情報；最好玩周末玩樂節目，即時瞓身報導，全天候為你update。',
        link: baseUrl,
        language: 'zh-HK' as const satisfies Language,
        image: `${baseUrl}/wp-content/themes/bucket/theme-content/images/196x196.png`,
        item: items,
    };
}
