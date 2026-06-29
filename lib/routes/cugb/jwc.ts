import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://jwc.cugb.edu.cn';

const channels: Record<string, string> = {
    xszq: '学生专区',
};

export const route: Route = {
    path: '/jwc/:channel?',
    categories: ['university'],
    example: '/cugb/jwc/xszq',
    parameters: { channel: '栏目，默认为 `xszq` 学生专区' },
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
            source: ['jwc.cugb.edu.cn/:channel'],
            target: '/jwc/:channel',
        },
    ],
    name: '教务处',
    maintainers: ['syncmeta'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const channel = ctx.req.param('channel') ?? 'xszq';
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;
    const listUrl = `${rootUrl}/${channel}/`;

    const { data: response } = await got(listUrl);
    const $ = load(response);

    const list: DataItem[] = $('li a')
        .toArray()
        .map((el) => {
            const item = $(el);
            const title = item.find('.list_con_main').text().trim();
            return {
                title,
                link: new URL(item.attr('href') as string, rootUrl).href,
                pubDate: timezone(parseDate(item.find('.list_con_time').text().trim()), 8),
            };
        })
        .filter((item) => item.title)
        .slice(0, limit);

    const items = (await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const { data: detailResponse } = await got(item.link as string);
                const content = load(detailResponse);
                item.description = content('div.detail_content_box').html() ?? '';
                return item;
            })
        )
    )) as DataItem[];

    return {
        title: `中国地质大学（北京）教务处 - ${channels[channel] ?? channel}`,
        link: listUrl,
        item: items,
        language: 'zh-CN',
        image: 'https://bm.cugb.edu.cn/vis/images/xhgf/logo.png',
        icon: 'https://bm.cugb.edu.cn/vis/images/xhgf/logo.png',
        logo: 'https://bm.cugb.edu.cn/vis/images/xhgf/logo.png',
    };
}
