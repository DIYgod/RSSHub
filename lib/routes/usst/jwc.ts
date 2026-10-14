import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/usst/jwc',
    name: '教务处',
    maintainers: ['Diffumist'],
    handler,
};
async function handler() {
    const host = 'https://jwc.usst.edu.cn';
    const response = await ofetch(host);
    const $ = load(response);
    const items = await pMap(
        $('#container-2 .news').toArray(),
        async (item) => {
            const $item = $(item);
            const title = $item.find('.news_title a').text();
            const date = $item.find('.news_date').text().trim();
            const pubDate = date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined;
            const singleUrl = new URL($item.find('.news_title a').attr('href')!, host).href;
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`usst:jwc:detail:${singleUrl}`, async () => {
                if (new URL(singleUrl).hostname === 'webpro.usst.edu.cn') {
                    return {};
                }
                const detailResponse = await ofetch(singleUrl, {
                    ignoreResponseError: true,
                });
                const $detail = load(detailResponse);
                const published = $detail('.arti_update')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                $detail('.wp_articlecontent [pdfsrc]').each((_, el) => {
                    const attachment = $detail(el);
                    const title = attachment.attr('sudyfile-attr')?.match(/'title':'(.+?)'/)?.[1] ?? 'PDF';
                    const attachmentUrl1 = new URL(attachment.attr('pdfsrc')!, singleUrl).href;
                    attachment.replaceWith($detail('<a>').attr('href', attachmentUrl1).text(title));
                });
                return {
                    description: $detail('.wp_articlecontent').html(),
                    author:
                        $detail('.arti_info.info1 .item_con').text().trim() ||
                        $detail('.arti_publisher')
                            .first()
                            .text()
                            .replace(/^发布者[：:]\s*/, '')
                            .trim() ||
                        undefined,
                    pubDate: published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined,
                };
            });
            return { title, link: singleUrl, ...details, pubDate: details.pubDate ?? pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: '上海理工大学 - 教务处',
        link: `${host}/`,
        description: '上海理工大学 - 教务处',
        item: items,
    };
}
