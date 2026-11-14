import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['multimedia'],
    example: '/abskoop',
    radar: [
        {
            source: ['ahhhhfs.com/'],
            target: '',
        },
    ],
    name: '存档列表',
    maintainers: ['zhenhappy'],
    handler,
    url: 'ahhhhfs.com/',
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const requestedLimit = getRouteLimit(ctx, 10);
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const feed = await parser.parseURL('https://www.ahhhhfs.com/feed/');
    const items = feed.items
        .slice(0, limit)
        .map((item) => ({
            title: item.title ?? '',
            link: item.link,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            updated: item.isoDate ? parseDate(item.isoDate) : undefined,
            author: item.creator ?? item.author,
            category: item.categories,
            description: item.content ?? item.contentSnippet,
        }))
        .filter((item) => item.title);

    return {
        title: 'ahhhhfs-A姐分享',
        link: 'https://www.ahhhhfs.com',
        description:
            'A姐分享，分享各种网络云盘资源、BT种子、高清电影电视剧和羊毛福利，收集各种有趣实用的软件和APP的下载、安装、使用方法，发现一些稀奇古怪的的网站，折腾一些有趣实用的教程，关注谷歌苹果等互联网最新的资讯动态，探索新领域，发现新美好，分享小快乐。',
        item: items,
    };
}
