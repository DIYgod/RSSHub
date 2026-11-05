import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.miit.gov.cn';

export const route: Route = {
    path: '/yjzj',
    categories: ['government'],
    example: '/gov/miit/yjzj',
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
            source: ['miit.gov.cn/gzcy/yjzj/index.html'],
        },
    ],
    name: '意见征集',
    maintainers: ['Fatpandac'],
    handler,
    url: 'miit.gov.cn/gzcy/yjzj/index.html',
};

async function handler() {
    const url = `${rootUrl}/gzcy/yjzj/index.html`;

    const indexResponse = await got(url);
    const indexContent = load(indexResponse.data);
    const dataRequestUrl = indexContent('div.clist_con > script:nth-child(2)')
        .toArray()
        .map((item) => ({
            url: `${rootUrl}${indexContent(item).attr('url')}`,
            queryData: JSON.parse(indexContent(item).attr('querydata')!.replaceAll('"', '|').replaceAll(/['|]/g, '"')),
        }))[0];

    const dataUrl = `${dataRequestUrl.url}?${Object.entries(dataRequestUrl.queryData)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`;
    const response = await got({
        method: 'get',
        url: dataUrl,
    });
    const $ = load(response.data.data.html);
    const list = $('ul > li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const pubDate = $(item).find('span').text();
            return {
                title: $(item).find('a').text(),
                link: new URL($(item).find('a').attr('href')!, rootUrl).href,
                pubDate: pubDate ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('#con_con').html();
                const pubDate = content('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate), 8);
                }

                return item;
            })
        )
    );

    return {
        title: '工业和信息化部 - 意见征集',
        link: url,
        item: items,
    };
}
