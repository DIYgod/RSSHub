import type { DataItem, Route } from '@/types';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['other'],
    example: '/bing/search/rss',
    parameters: { keyword: '搜索关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cn.bing.com/'],
            target: '',
        },
    ],
    name: '搜索',
    maintainers: ['CaoMeiYouRen'],
    handler,
    url: 'cn.bing.com/',
};

async function handler(ctx) {
    const q = ctx.req.param('keyword');
    const searchParams = new URLSearchParams({
        format: 'rss',
        q,
    });
    const url = new URL('https://cn.bing.com/search');
    url.search = searchParams.toString();
    const data = await parser.parseURL(url.href);
    return {
        title: data.title!,
        link: data.link,
        description: data.description + ' - ' + data.copyright,
        image: data.image!.url,
        item: data.items.map((e) => ({
            ...e,
            description: e.content,
            pubDate: e.pubDate ? parseDate(e.pubDate, 'dddd, DD M[月] YYYY HH:mm:ss [GMT]', 0) : undefined,
        })) as DataItem[],
    };
}
