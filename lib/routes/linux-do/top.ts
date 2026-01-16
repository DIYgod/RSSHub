import type { Route } from '@/types';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/top/:period?',
    categories: ['bbs'],
    example: '/linux-do/top',
    parameters: {
        period: '时间范围，可选值为 `all`、`yearly`、`quarterly`、`monthly`、`weekly`、`daily`，默认为 `all`',
    },
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
            source: ['linux.do/top', 'linux.do'],
            target: '/top',
        },
    ],
    name: '热门话题',
    maintainers: ['JackyST0'],
    handler,
    description: '获取 LinuxDo 论坛的热门话题，支持按时间范围筛选',
};

async function handler(ctx) {
    const period = ctx.req.param('period') || 'all';

    const rssUrl = `https://linux.do/top/${period}.rss`;

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

    const periodName =
        {
            all: '全部',
            yearly: '年度',
            quarterly: '季度',
            monthly: '月度',
            weekly: '周',
            daily: '日',
        }[period] || '全部';

    return {
        title: `LinuxDo - ${periodName}热门话题`,
        link: `https://linux.do/top/${period}`,
        description: `LinuxDo Linux 和开源技术社区${periodName}热门话题`,
        item: items,
    };
}
