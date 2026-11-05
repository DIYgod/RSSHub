import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/zwgk',
    categories: ['government'],
    example: '/gov/pudong/zwgk',
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
            source: ['www.pudong.gov.cn/zwgk/zxxxgk/index.html'],
            target: '/zwgk',
        },
    ],
    name: '政务公开',
    maintainers: ['himingway'],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.pudong.gov.cn/zwgk-search-front/api/data/affair', {
        method: 'POST',
        body: {
            channelList: ['5144'],
            pageSize: 20,
        },
    });
    const data = response.data.list;

    const list = data.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: item.display_date === undefined || item.display_date === null ? undefined : parseDate(item.display_date),
    }));

    const items = await pMap(
        list,
        (item: DataItem & { link: string }) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('#ivs_content').html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '信息公开_政务公开-上海市浦东新区门户网站',
        link: 'https://www.pudong.gov.cn/zwgk/zxxxgk/index.html',
        item: items,
    };
}
