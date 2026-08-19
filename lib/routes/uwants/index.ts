import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.uwants.com';

export const route: Route = {
    path: '/:fid',
    categories: ['new-media'],
    example: '/uwants/1520',
    parameters: { fid: 'fid，可在对应板块页的 URL 中找到' },
    features: {
        antiCrawler: true,
    },
    name: '版塊',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { fid } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '15');

    const currentUrl = `${rootUrl}/archiver/?fid-${fid}.html`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}/${$item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const data = detailResponse
                    .replaceAll(/\[(\w+)=([\w#]+)\]/g, '<span style="$1: $2;">')
                    .replaceAll(/\[url=(.*?)\]/g, '<a href="$1">')
                    .replaceAll(/\[\/(color|size)\]/g, '</span>')
                    .replaceAll('[/url]', '</a>')
                    .replaceAll(/\[(\w+)\]/g, '<$1>')
                    .replaceAll(/\[\/(\w+)\]/g, '</$1>');

                const content = load(data);

                const cite = content('cite');
                const date = cite
                    .eq(0)
                    .parent()
                    .text()
                    .match(/\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{2} [AP]M/)?.[0];

                return {
                    title: item.title,
                    link: `${rootUrl}/viewthread.php?tid=${item.link.match(/tid-(\d+)\.html/)![1]}`,
                    author: cite.eq(0).text(),
                    description: content('.archiver_post').html(),
                    pubDate: date ? timezone(parseDate(date, 'YYYY-M-D hh:mm A'), 8) : undefined,
                };
            })
        )
    );

    return {
        title: `${$('h1 a').text().replace('查看完整版本: ', '')} - Uwants.com`,
        link: `${rootUrl}/forumdisplay.php?fid=${fid}`,
        item: items,
    };
}
