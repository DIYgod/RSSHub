import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['finance'],
    example: '/nbd',
    parameters: { id: '分类 id，见下表，默认为要闻' },
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
            source: ['nbd.com.cn/', 'nbd.com.cn/columns/:id?'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    url: 'nbd.com.cn/',
    description: `| 头条 | 要闻 | 图片新闻 | 推荐 |
  | ---- | ---- | -------- | ---- |
  | 2    | 3    | 4        | 5    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '3';

    const rootUrl = 'https://www.nbd.com.cn';
    const currentUrl = `${rootUrl}/columns/${id}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.u-news-title a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                if (!detailResponse.url.startsWith(`${rootUrl}/`)) {
                    return item;
                }
                const content = load(detailResponse.data);

                item.description = content('.g-articl-text').html();
                item.pubDate = timezone(parseDate(detailResponse.data.match(/"pubDate": "(.*)"/)[1]), +8);

                return item;
            })
        )
    );

    return {
        title: `${$('h1').text() || $('.u-channelname').text()} - 每经网`,
        link: currentUrl,
        item: items,
    };
}
