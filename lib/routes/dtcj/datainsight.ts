import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/datainsight/:id?',
    categories: ['finance'],
    example: '/dtcj/datainsight',
    parameters: { id: '分类，见下表，默认为全部' },
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
            source: ['dtcj.com/insighttopic/:id'],
            target: '/datainsight/:id',
        },
    ],
    name: '数据洞察',
    maintainers: ['nczitzk'],
    handler,
    url: 'dtcj.com/dtcj/datainsight',
    description: `| 城数 | NEXT 情报局 | 专业精选 |
| ---- | ----------- | -------- |
| 3    | 1           | 4        |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://dtcj.com';
    const currentUrl = `${rootUrl}/${id ? `insighttopic/${id}` : 'datainsight'}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.info-2_P1UM a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.content-3mNFyi').html();
                item.pubDate = parseDate(detailResponse.data.match(/"date":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}\+\d{2}:\d{2})","thumbnail_url":/)[1]);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
