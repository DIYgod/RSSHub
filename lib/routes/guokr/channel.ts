import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

async function loadFullPage(id) {
    const link = `https://apis.guokr.com/minisite/article/${id}.json`;
    const content = await cache.tryGet(link, async () => {
        const res = await got(link);
        return res.data.result.content;
    });
    return content;
}

const channelMap = {
    calendar: 'pac',
    institute: 'predator',
    foodlab: 'predator',
    pretty: 'beauty',
};

export const route: Route = {
    path: '/:channel',
    categories: ['new-media'],
    example: '/guokr/calendar',
    parameters: { channel: '专栏类别' },
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
            source: ['guokr.com/'],
        },
    ],
    name: '果壳网专栏',
    maintainers: ['DHPO', 'hoilc'],
    handler,
    url: 'guokr.com/',
    description: `| 物种日历 | 吃货研究所 | 美丽也是技术活 |
  | -------- | ---------- | -------------- |
  | calendar | institute  | beauty         |`,
};

async function handler(ctx) {
    const channel = channelMap[ctx.req.param('channel')] ?? ctx.req.param('channel');

    const response = await got(`https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_wx&channel_key=${channel}&offset=0&limit=10`);
    const items = response.data.result;

    if (items.length === 0) {
        throw new Error('Unknown channel');
    }

    const channel_name = items[0].channels[0].name;
    const channel_url = items[0].channels[0].url;

    const result = await Promise.all(
        items.map(async (item) => ({
            title: item.title,
            description: await loadFullPage(item.id), // Mercury 无法正确解析全文，故这里手动加载
            pubDate: item.date_published,
            link: item.url,
            author: item.author.nickname,
        }))
    );

    return {
        title: `果壳网 ${channel_name}`,
        link: channel_url,
        item: result,
    };
}
