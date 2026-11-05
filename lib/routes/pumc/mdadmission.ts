import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mdadmission',
    categories: ['university'],
    example: '/pumc/mdadmission',
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
            source: ['mdadmission.pumc.edu.cn/mdweb/site', 'mdadmission.pumc.edu.cn/'],
        },
    ],
    name: '“4+4” 试点班招生网通知公告',
    maintainers: ['nczitzk'],
    handler,
    url: 'mdadmission.pumc.edu.cn/mdweb/site',
};

async function handler(ctx) {
    const requestedLimit = Number(ctx.req.query('limit'));
    // oxlint-disable-next-line unicorn-js/prefer-number-is-safe-integer -- Preserve the existing positive-integer limit acceptance range and default.
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 100;

    const rootUrl = 'https://mdadmission.pumc.edu.cn';
    const currentUrl = `${rootUrl}/mdweb/site!noticeList?param.infoTypeId=&rows=${limit}&pages=1`;

    const response = await got(currentUrl);

    const $ = load(response.data);

    let items = $('div.media')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            const a = $item.find('h4.media-heading a');
            const published = $item.find('span').first().text();

            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: published ? parseDate(published, 'DDYYYY-MM') : undefined,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                content('h3').remove();

                return { description: content('div.media-body div').last().html() };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: '北京协和医学院招生网 - 通知公告',
        link: currentUrl,
        item: items,
    };
}
