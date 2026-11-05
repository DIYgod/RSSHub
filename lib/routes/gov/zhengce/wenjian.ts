import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/wenjian/:pcodeJiguan?',
    categories: ['government'],
    example: '/gov/zhengce/wenjian',
    parameters: { pcodeJiguan: '文种分类。国令、国发、国函、国发明电、国办发、国办函、国办发明电、其他' },
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
            source: ['www.gov.cn/'],
            target: '/wenjian',
        },
    ],
    name: '最新文件',
    maintainers: ['ciaranchen'],
    handler,
    url: 'www.gov.cn/',
};

async function handler(ctx) {
    const pcodeJiguan = ctx.req.param('pcodeJiguan');
    const link = 'http://sousuo.gov.cn/list.htm';
    const res = await got(link, {
        searchParams: {
            n: getRouteLimit(ctx, 20),
            sort: 'pubtime',
            t: 'paper',
            pcodeJiguan: pcodeJiguan ?? '',
        },
    });
    const $ = load(res.data);

    const list = $('body > div.dataBox > table > tbody > tr')
        .slice(1)
        .toArray()
        .map((elem): DataItem => {
            const $elem = $(elem);
            const date = $elem.find('td:nth-child(5)').text();
            return {
                title: $elem.find('td:nth-child(2) > a').text(),
                link: $elem.find('td:nth-child(2) > a').attr('href'),
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const contentData = await got(item.link);
                const $ = load(contentData.data);
                item.description = $('#UCAP-CONTENT').html();
                return item;
            })
        )
    );

    return {
        title: '最新文件 - 中国政府网',
        link: res.url,
        item: items,
    };
}
