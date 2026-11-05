import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gk/zfxxgkpt/fdzdgknr',
    categories: ['government'],
    example: '/gov/mem/gk/zfxxgkpt/fdzdgknr',
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
            source: ['www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr'],
            target: '/gk/zfxxgkpt/fdzdgknr',
        },
    ],
    name: '法定主动公开内容',
    maintainers: ['skeaven'],
    handler,
    description: '应急管理部法定主动公开内容，包含通知、公告、督办、政策解读等，可供应急相关工作人员及时获取政策信息',
};

async function handler(ctx) {
    const sourceLimit = getRouteLimit(ctx, 30);
    const limit = ctx.req.query('sorted') === 'false' ? sourceLimit : Math.max(30, sourceLimit);

    const rootUrl = 'https://www.mem.gov.cn';
    const currentUrl = new URL('gk/zfxxgkpt/fdzdgknr/', rootUrl).href;

    const { data: fdzdgknrResponse } = await got(currentUrl);
    const fdzdgknr$ = load(fdzdgknrResponse);

    const iframeUrl = new URL(fdzdgknr$('div.scy_main_r iframe').attr('src')!, currentUrl).href;
    const { data: response } = await got(iframeUrl);
    const $ = load(response);
    const icon = new URL('favicon.ico', rootUrl).href;

    let items = $('div.scy_main_V2_list')
        .find('tr')
        .slice(1, limit + 1)
        .toArray()
        .map((item): (DataItem & { link: string }) | null => {
            const aLabel = $(item).find('a[href]');
            const href = aLabel.attr('href');
            if (!href) {
                return null;
            }
            const link = new URL(href, iframeUrl).href;
            const pubDate = $(item).find('.fbsj').text();
            return {
                title: aLabel.contents().first().text(),
                link,
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
            };
        })
        .filter((item) => item !== null);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async (): Promise<DataItem & { link: string }> => {
                if (!item.link.endsWith('.html') && !item.link.endsWith('.shtml')) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);

                const description = content('#content').html();
                const author = content('td.td_lable:contains("所属机构")').next('td').text();
                const category = content('td.td_lable:contains("主题分类")').next('td').text();

                return {
                    ...item,
                    description,
                    author: author || undefined,
                    category: category || undefined,
                };
            })
        )
    );

    return {
        item: items,
        title: route.name,
        link: currentUrl,
        icon,
    };
}
