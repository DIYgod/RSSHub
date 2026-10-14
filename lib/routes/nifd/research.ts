import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'http://www.nifd.cn';

const titleMap = {
    '7a6a826d-b525-42aa-b550-4236e524227f': '周报',
    '128d602c-7041-4546-beff-83e605f8a370': '双周报',
    '0712e220-fa3b-44d4-9226-bc3d57944e19': '月报',
    'b66aa691-87ee-4bfe-ac6b-2460386166ee': '季报',
    'c714853a-f09e-4510-8835-30a448fff7e3': '年报',
    '17d0b29b-7912-498a-b9c3-d30508220158': '课题报告',
    'e6a6d3a5-4bda-4739-9765-e4e41c900bcc': '学术报告',
    '3d23ba0e-4f46-44c2-9d21-6b38df4cdd70': '工作论文',
    '3333d2af-91d6-429b-be83-28b92f31b6d7': '研究评价',
    '6363bdc7-3e1b-4771-a904-6162cd3a3143': '其他报告',
};

export const route: Route = {
    path: '/research/:categoryGuid?',
    categories: ['finance'],
    example: '/nifd/research/3333d2af-91d6-429b-be83-28b92f31b6d7',
    parameters: { categoryGuid: '资讯类型，默认为周报' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究',
    maintainers: ['Fatpandac'],
    handler,
    description: `资讯类型可以从网址中获取，如：

\`http://www.nifd.cn/Research?categoryGuid=7a6a826d-b525-42aa-b550-4236e524227f\` 对应 \`/nifd/research/7a6a826d-b525-42aa-b550-4236e524227f\``,
};

async function handler(ctx) {
    const categoryGuid = ctx.req.param('categoryGuid') ?? '7a6a826d-b525-42aa-b550-4236e524227f';
    const url = `${rootUrl}/Research?categoryGuid=${categoryGuid}`;

    const response = await got.get(url);
    const $ = load(response.data);
    const list = $('div.qr-main-item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const date = ($item.find('p > span:nth-child(1)').text() || $item.children('span').text()).replaceAll(/[[\]]/g, '');
            return {
                title: $item.find('h2, h4').first().text(),
                link: new URL($item.find('a').attr('href')!, rootUrl).href,
                author: $item.find('p > span:nth-child(2)').text(),
                pubDate: date ? timezone(parseDate(date, ['YYYY-MM-DD', 'YYYY年MM月DD日']), 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`nifd:details:v2:${item.link}`, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);
                const details: Pick<DataItem, 'description' | 'enclosure_url' | 'enclosure_type' | 'enclosure_title'> = { description: content('div.qrd-content').html() };
                const $enclosureEl = content('div.report-bottom a').first();
                const enclosureUrl = $enclosureEl.attr('href');
                if (enclosureUrl) {
                    details.enclosure_url = new URL(enclosureUrl, rootUrl).href;
                    details.enclosure_type = `application/${enclosureUrl.split(/\./).pop() ?? 'pdf'}`;
                    details.enclosure_title = $enclosureEl.prev().text();
                }
                return details;
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `国家金融与发展实验室 - ${titleMap[categoryGuid]}`,
        link: url,
        item: items,
    };
}
