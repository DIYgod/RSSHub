import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { finishArticleItem, WeChatMpError } from '@/utils/wechat-mp';

const baseUrl = 'https://www.slowmist.com';

export const route: Route = {
    path: '/:type?',
    categories: ['new-media'],
    example: '/slowmist/research',
    parameters: { type: '分类，见下表，默认为公司新闻' },
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
            source: ['slowmist.com/zh/news.html'],
        },
    ],
    name: '动态',
    maintainers: ['AtlasQuan'],
    handler,
    url: 'slowmist.com/zh/news.html',
    description: `| 公司新闻 | 漏洞披露 | 技术研究 |
| -------- | -------- | -------- |
| news     | vul      | research |`,
};

async function handler(ctx) {
    let type = ctx.req.param('type');

    let title = '慢雾科技 - ';
    switch (type) {
        case 'news':
            title += '公司新闻';

            break;

        case 'vul':
            title += '漏洞披露';

            break;

        case 'research':
            title += '技术研究';

            break;

        default:
            type = 'news';
            title += '公司新闻';
    }

    const url = `${baseUrl}/api/get_list?type=${type}`;

    const response = await got(url);

    let items: DataItem[] = (response.data.data || []).map((item): DataItem => ({
        title: item.title,
        link: item.url,
        description: item.desc,
        pubDate: item.date ? parseDateInTimezone(item.date, 8) : undefined,
    }));

    items = await pMap(
        items,
        async (item) => {
            try {
                const detail = await finishArticleItem({ ...item, description: undefined, pubDate: undefined });
                return { ...detail, description: detail.description || item.description, pubDate: detail.pubDate ?? item.pubDate };
            } catch (error) {
                if (!(error instanceof FetchError || error instanceof WeChatMpError)) {
                    throw error;
                }
                logger.warn(`Could not fetch the WeChat article at ${item.link}: ${error.message}`);
                return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title,
        link: `${baseUrl}/zh/news.html`,
        item: items,
    };
}
