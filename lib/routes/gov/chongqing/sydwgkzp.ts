import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/sydwgkzp/:year?',
    url: 'rlsbj.cq.gov.cn/',
    categories: ['government'],
    example: '/gov/chongqing/sydwgkzp',
    parameters: {
        year: '需要订阅的年份，格式为`YYYY`，必须小于等于当前年份，默认为当前年份',
    },
    radar: [
        {
            source: ['rlsbj.cq.gov.cn/'],
        },
    ],
    name: '人力社保局 - 事业单位公开招聘',
    maintainers: ['MajexH'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const current = currentYear();

    // Use the requested archive year, or the current year by default.
    const { year: tempYear } = ctx.req.param();
    if (tempYear && (!/^\d{4}$/.test(tempYear) || Number(tempYear) < 1 || Number(tempYear) > current)) {
        throw new InvalidParameterError(`year must be a positive four-digit year no later than ${current}.`);
    }
    const year = tempYear ? Number(tempYear) : current;

    // The current year is linked through a redirect page.
    const yearPart = year === current ? '' : `sydwgkzp${year}/`;
    let sydwgkzpUrl = `https://rlsbj.cq.gov.cn/zwxx_182/sydw/${yearPart}`;

    const { data: response } = await got(sydwgkzpUrl);

    let $ = load(response);

    // Follow the official archive redirect when present.
    const metaRefresh = $('meta[http-equiv="Refresh"]').attr('content');

    if (metaRefresh) {
        const redirectPath = metaRefresh.split('URL=', 2)[1];
        sydwgkzpUrl = new URL(redirectPath, sydwgkzpUrl).href;

        const { data: newResponse } = await got(sydwgkzpUrl);
        $ = load(newResponse);
    }

    const list = $('ul[class="rsj-list1"] > li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const title = $item.find('a');
            const pubDate = $item.find('span').text();
            return {
                title: title.text(),
                link: new URL(title.attr('href')!, sydwgkzpUrl).href,
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                const pubDate = $('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate), 8);
                }
                item.description = $('.trs_editor_view').html();
                return item;
            })
        )
    );

    return {
        title: `重庆市事业单位${year}年公开招聘`,
        link: sydwgkzpUrl,
        item: items,
    };
}

function currentYear(): number {
    return new Date().getFullYear();
}
