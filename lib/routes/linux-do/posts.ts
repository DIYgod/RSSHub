import type { Route } from '@/types';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/posts',
    categories: ['bbs'],
    example: '/linux-do/posts',
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
            source: ['linux.do/posts', 'linux.do'],
            target: '/posts',
        },
    ],
    name: '最新帖子',
    maintainers: ['JackyST0'],
    handler,
    description: '获取 LinuxDo 论坛的最新回复和讨论',
};

async function handler() {
    const rssUrl = 'https://linux.do/posts.rss';

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
        title: 'LinuxDo - 最新帖子',
        link: 'https://linux.do',
        description: 'LinuxDo Linux 和开源技术社区最新帖子',
        item: items,
    };
}
