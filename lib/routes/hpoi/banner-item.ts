import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/bannerItem',
    categories: ['anime'],
    example: '/hpoi/bannerItem',
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
            source: ['www.hpoi.net/bannerItem/list'],
        },
    ],
    name: '热门推荐',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.hpoi.net/bannerItem/list',
};

async function handler() {
    const link = 'https://www.hpoi.net/bannerItem/list?categoryId=0&bannerItemType=0&subType=0&page=1';
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);

    const items = await pMap(
        $('#content .item').toArray(),
        async (_item) => {
            const $item = $(_item);
            const link = new URL($item.find('a').attr('href') ?? '', 'https://www.hpoi.net').href;
            if (!link.startsWith('https://www.hpoi.net/')) {
                return;
            }
            return await cache.tryGet(link, async () => {
                const detailResponse = await got(link);
                const $$ = load(detailResponse.data);
                $$('.hpoi-album-content .album-ibox').remove();
                $$('.hpoi-album-content .row').remove();
                $$('.hpoi-album-content .hpoi-hr-line').remove();
                return {
                    title: $item.find('.title').text(),
                    link,
                    description: $$('.hpoi-album-content').html() || `<img src="${$item.find('img').attr('src')}">`,
                    pubDate: $item.find('.time').text().replace('发布时间：', '') ? timezone(parseDate($item.find('.time').text().replace('发布时间：', '')), 8) : undefined,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: 'Hpoi 手办维基 - 热门推荐',
        link,
        item: items.filter((item) => !!item),
    };
}
