import { Data, DataItem, Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio'; // html parser

export const handler = async (ctx): Promise<Data> => {
    const feed = await parser.parseURL('https://feed.iplaysoft.com');
    const limit = Number.parseInt(ctx.req.query('limit') || '20', 10);

    const filteredItems = feed.items
        .filter((item) => {
            if (!item?.link || !item?.pubDate) {
                return false;
            }
            return new URL(item.link).hostname.match(/.*\.iplaysoft\.com$/);
        })
        .slice(0, limit) as DataItem[];

    const items: DataItem[] = await Promise.all(
        filteredItems.map(
            (item) =>
                cache.tryGet(item.link as string, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    $('.entry-content').find('div[style*="overflow:hidden"]').remove();

                    return {
                        title: item.title,
                        description: $('.entry-content').html(),
                        link: item.link,
                        author: item.author,
                        pubDate: parseDate(item.pubDate as string),
                    } as DataItem;
                }) as Promise<DataItem>
        )
    );

    return {
        title: '异次元软件世界',
        description: '软件改变生活',
        language: 'zh-CN',
        link: 'https://www.iplaysoft.com',
        item: items,
    };
};

export const route: Route = {
    path: '/',
    name: '首页',
    url: 'www.iplaysoft.com',
    maintainers: ['williamgateszhao', 'cscnk52', 'LokHsu'],
    handler,
    example: '/iplaysoft',
    parameters: {},
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.iplaysoft.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
