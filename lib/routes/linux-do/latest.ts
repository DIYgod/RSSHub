import type { Route } from '@/types';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/latest',
    categories: ['bbs'],
    example: '/linux-do/latest',
    parameters: {},
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
            source: ['linux.do/latest', 'linux.do'],
            target: '/latest',
        },
    ],
    name: '最新话题',
    maintainers: ['JackyST0'],
    handler,
    description: '获取 LinuxDo 论坛的最新主题',
};

async function handler() {
    const rssUrl = 'https://linux.do/latest.rss';

    const response = await got(rssUrl, {
        headers: {
            'Accept-Encoding': 'identity',
        },
    });

    const feed = await RSSParser.parseString(response.data);

    const items = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
        description: item.content ?? item.description,
        pubDate: item.pubDate,
        author: item.creator,
        category: item.categories,
    }));

    return {
        title: 'LinuxDo - 最新话题',
        link: 'https://linux.do/latest',
        description: 'LinuxDo Linux 和开源技术社区最新话题',
        item: items,
    };
}
