import { Route } from '@/types';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import 'dayjs/locale/zh-cn.js';
dayjs.extend(localizedFormat);

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
    const data = await parser.parseURL(url.toString());
    return {
        title: data.title,
        link: data.link,
        description: data.description + ' - ' + data.copyright,
        image: data.image.url,
        item: data.items.map((e) => ({
            ...e,
            description: e.content,
            pubDate: parseDate(e.pubDate, 'dddd, DD MMM YYYY HH:mm:ss [GMT]', 'zh-cn'),
        })),
    };
}
