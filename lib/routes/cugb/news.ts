import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.cugb.edu.cn';

const channels = {
    bdxw: '北地新闻',
} satisfies Record<string, string>;

export const route: Route = {
    path: '/news/:channel?',
    categories: ['university'],
    example: '/cugb/news/bdxw',
    parameters: { channel: '栏目，默认为 `bdxw` 北地新闻' },
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
            source: ['www.cugb.edu.cn/:channel.jhtml'],
            target: '/news/:channel',
        },
    ],
    name: '校园新闻',
    maintainers: ['syncmeta'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const channel = ctx.req.param('channel') ?? 'bdxw';
    const limit = getRouteLimit(ctx, 20);
    const listUrl = `${rootUrl}/${channel}.jhtml`;

    const { data: response } = await got(listUrl);
    const $ = load(response);

    const list: DataItem[] = $('li a.con')
        .toArray()
        .map((el) => {
            const item = $(el);
            const [date, author] = item
                .find('span')
                .text()
                .split('|')
                .map((s) => s.trim());
            return {
                title: item.find('h3.tit').text(),
                link: new URL(item.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate(date), 8),
                author,
            };
        });

    const uniqueItems = new Map(list.map((item) => [item.link, item])).values().toArray();
    const articles = ctx.req.query('sorted') === 'false' ? uniqueItems : [...uniqueItems].sort((a, b) => Number(b.pubDate) - Number(a.pubDate));
    const items = await Promise.all(
        articles.slice(0, limit).map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link!);
                const content = load(detailResponse);
                item.description = content('div.postbody').html();
                return item;
            })
        )
    );

    return {
        title: `中国地质大学（北京） - ${channels[channel] ?? channel}`,
        link: listUrl,
        item: items,
        language: 'zh-CN',
        image: 'https://bm.cugb.edu.cn/vis/images/xhgf/logo.png',
        icon: 'https://bm.cugb.edu.cn/vis/images/xhgf/logo.png',
        logo: 'https://bm.cugb.edu.cn/vis/images/xhgf/logo.png',
    };
}
