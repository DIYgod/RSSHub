import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/zhejiang/gwy/:category?/:column?',
    categories: ['government'],
    example: '/gov/zhejiang/gwy/1',
    parameters: { category: '分类，见下表，默认为全部', column: '地市专栏，见下表，默认为全部' },
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
            source: ['zjks.gov.cn/zjgwy/website/init.htm', 'zjks.gov.cn/zjgwy/website/queryDetail.htm', 'zjks.gov.cn/zjgwy/website/queryMore.htm'],
            target: '/zhejiang/gwy',
        },
    ],
    name: '通知',
    maintainers: ['nczitzk'],
    handler,
    url: 'zjks.gov.cn/zjgwy/website/init.htm',
    description: `| 分类         | id |
| ------------ | -- |
| 重要通知     | 1  |
| 招考公告     | 2  |
| 招考政策     | 3  |
| 面试体检考察 | 4  |
| 录用公示专栏 | 5  |

| 地市         | id    |
| ------------ | ----- |
| 浙江省       | 133   |
| 浙江省杭州市 | 13301 |
| 浙江省宁波市 | 13302 |
| 浙江省温州市 | 13303 |
| 浙江省嘉兴市 | 13304 |
| 浙江省湖州市 | 13305 |
| 浙江省绍兴市 | 13306 |
| 浙江省金华市 | 13307 |
| 浙江省衢州市 | 13308 |
| 浙江省舟山市 | 13309 |
| 浙江省台州市 | 13310 |
| 浙江省丽水市 | 13311 |
| 省级单位     | 13317 |`,
};

async function handler(ctx) {
    const { category, column } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'http://gwy.zjks.gov.cn';
    const currentUrl = new URL(`zjgwy/website/${category ? 'queryMore' : 'init'}.htm`, rootUrl).href;
    const detailUrl = new URL('zjgwy/website/queryDetail.htm', rootUrl).href;

    const { data: response } = await got.post(currentUrl, {
        form: {
            dsdm: column,
            mkxh: category,
            oldornew: 'new',
        },
    });

    const $ = load(response);

    let items = $('a[onclick^="queryDetail"]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const matches = item.prop('onclick').match(/queryDetail\('?(\d+)'?, '?(\d+)'?\);/);

            return {
                title: item.text(),
                link: detailUrl,
                category: matches[1],
                guid: `zjks-${matches[1]}-${matches[2]}`,
                pubDate: parseDate(item.parent().next().text()),
                tzid: matches[2],
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const { data: detailResponse } = await got.post(detailUrl, {
                    form: {
                        mkxh: item.category,
                        oldornew: 'new',
                        dsdm: column,
                        tzid: item.tzid,
                    },
                });

                const content = load(detailResponse);

                item.description = content('div.ibox-content').last().html();
                item.category = [content('div.ibox-title').last().find('h5').first().text()];

                const files = content('a.ke-insertfile');

                if (files.length > 0) {
                    const file = files.first();
                    item.enclosure_url = file.prop('href');
                }

                delete item.tzid;

                return item;
            })
        )
    );

    const columnName = $('button.btn-success').last().text();
    const categoryName = $('table').parent().prev().find('h5').text();

    return {
        item: items,
        title: `${$('title').text()} - ${columnName}${categoryName}`,
        link: currentUrl,
        description: $('div.title-font2').text(),
        subtitle: `${columnName}${categoryName}`,
        author: $('div.title-font').text(),
        allowEmpty: true,
    };
}
