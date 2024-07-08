import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['program-update'],
    example: '/iplaysoft',
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
            source: ['www.iplaysoft.com'],
        },
    ],
    name: '全部文章',
    maintainers: ['williamgateszhao'],
    handler,
};

async function handler(ctx) {
    const feed = await parser.parseURL('https://www.iplaysoft.com/feed/atom');
    const filteredItems = feed.items
        .filter((item) => item?.link && item?.pubDate && new URL(item.link).hostname.match(/.*\.iplaysoft\.com$/))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20) as DataItem[];

    const items: DataItem[] = await Promise.all(
        filteredItems.map(
            (item) =>
                cache.tryGet(item.link as string, async () => {
                    const response = await ofetch(item.link as string);
                    const $ = load(response);
                    const content = $('.entry-content');
                    content
                        .find('div')
                        .filter((_index, element) => {
                            const style = $(element).attr('style');
                            return style !== undefined && style.includes('overflow:hidden');
                        })
                        .remove();
                    return {
                        title: item.title,
                        description: content.html(),
                        link: item.link,
                        author: item.author,
                        pubDate: parseDate(item.pubDate as string),
                    } as DataItem;
                }) as Promise<DataItem>
        )
    );

    return {
        title: '异次元软件世界',
        link: 'https://www.iplaysoft.com',
        language: 'zh-CN',
        item: items,
    };
}
