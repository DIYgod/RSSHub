import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/nea/sjzz/ghs',
    categories: ['government'],
    example: '/gov/nea/sjzz/ghs',
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
            source: ['nea.gov.cn/sjzz/ghs/'],
        },
    ],
    name: '发展规划司',
    maintainers: ['nczitzk'],
    handler,
    url: 'nea.gov.cn/sjzz/ghs/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 35;

    const rootUrl = 'https://www.nea.gov.cn';
    const currentUrl = new URL('sjzz/ghs/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.right_box ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: a.prop('href'),
                pubDate: parseDate(item.find('span.date-tex').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('td.detail').html() || content('div.article-content td').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = content('meta[name="keywords"]').prop('content').split(/,/);
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh',
        subtitle: $('meta[name="ColumnType"]').prop('content'),
        author: $('meta[name="ColumnKeywords"]').prop('content'),
    };
}
