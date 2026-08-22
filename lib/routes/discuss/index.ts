import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:fid',
    categories: ['new-media'],
    example: '/discuss/62',
    parameters: { fid: 'fid，可在对应板块页的 URL 中找到' },
    name: '版塊',
    maintainers: ['nczitzk'],
    features: {
        antiCrawler: true,
    },
    handler,
};

async function handler(ctx: Context) {
    const { fid } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!) : 15;

    const rootUrl = 'https://www.discuss.com.hk';
    const currentUrl = `${rootUrl}/archiver/?fid-${fid}.html`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('li a')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}/${$item.attr('href')}`,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);

                const data = detailResponse
                    .replaceAll('[img]https://www.discuss.com.hk/images/common/back.gif[/img]', '')
                    .replaceAll(/\[url=(.*?)\]/g, '<a href="$1">')
                    .replaceAll(/\[(\w+)=(.*?)\]/g, '<span style="$1: $2;">')
                    .replaceAll(/\[\/(color|size)\]/g, '</span>')
                    .replaceAll('[/url]', '</a>')
                    .replaceAll(/\[(\w+)\]/g, '<$1>')
                    .replaceAll(/\[\/(\w+)\]/g, '</$1>');

                const content = load(data);

                const cite = content('cite');
                const firstAuthorParent = cite.eq(0).parent();

                item.author = cite.eq(0).text();
                item.description = content('.archiver_post').html();
                item.link = `${rootUrl}/viewthread.php?tid=${item.link!.match(/tid-(\d+)\.html/)![1]}`;
                item.pubDate = timezone(parseDate(firstAuthorParent.text(), 'YYYY-M-D hh:mm A'), 8);

                return item;
            })
        )
    );

    return {
        title: `${$('h1 a').text().replace('查看完整版本            : ', '')} - 香港討論區`,
        link: `${rootUrl}/forumdisplay.php?fid=${fid}`,
        item: items,
    };
}
