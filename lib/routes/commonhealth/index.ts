import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category{.+}?',
    name: '分類',
    url: 'commonhealth.com.tw',
    maintainers: ['nczitzk'],
    example: '/commonhealth/channel/12',
    parameters: { category: '分類 id，可在對應分類頁面的 URL 中找到' },
    description: `
| 分類 | id |
| ---- | -- |
| ...  | ...|
`,
    categories: ['health'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.commonhealth.com.tw/:category'],
            target: '/:category',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category = 'channel' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://www.commonhealth.com.tw';
    const currentUrl = `${rootUrl}/${category.replace(/\//g, '-')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('div.news-container > div.col')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.card-caption a');
            const title = a.find('div.caption_title').text();
            const link = a.attr('href');
            const description = a.find('p').text();
            const pubDate = timezone(parseDate(item.find('div.caption_date').text()), +8);

            return {
                title,
                link,
                description,
                pubDate,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.article-content').html();
                item.author = content('meta[name="author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);

                return item;
            })
        )
    );

    return {
        title: `康健 - ${$('h1.title').text()}`,
        link: currentUrl,
        item: items,
    };
}
