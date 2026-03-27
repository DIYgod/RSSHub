import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date'; // 解析日期的工具函数

export const route: Route = {
    path: '/pudong/zwgk',
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
            target: '/pudong/zwgk',
        },
    ],
    name: '政务公开-浦东新区',
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
        pubDate: parseDate(item.display_date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('#ivs_content').first().html();
                return item;
            })
        )
    );

    return {
        // 源标题
        title: '信息公开_政务公开-上海市浦东新区门户网站',
        // 源链接
        link: 'https://www.pudong.gov.cn/zwgk/zxxxgk/index.html',
        // 源文章
        item: items,
    };
}
