import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.cugb.edu.cn';

const channels: Record<string, string> = {
    bdxw: '北地新闻',
};

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
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;
    const listUrl = `${rootUrl}/${channel}.jhtml`;

    const { data: response } = await got(listUrl);
    const $ = load(response);

    const list: DataItem[] = $('li a.con')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const item = $(el);
            const [date, author] = item
                .find('span')
                .text()
                .trim()
                .split('|')
                .map((s) => s.trim());
            return {
                title: item.find('h3.tit').text().trim(),
                link: new URL(item.attr('href') as string, rootUrl).href,
                pubDate: timezone(parseDate(date), 8),
                author,
            };
        });

    const items = (await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const { data: detailResponse } = await got(item.link as string);
                const content = load(detailResponse);
                item.description = content('div.postbody').html() ?? '';
                return item;
            })
        )
    )) as DataItem[];

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
