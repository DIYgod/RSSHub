import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/moe/s78/:column',
    categories: ['government'],
    example: '/gov/moe/s78/A13',
    parameters: { column: '司局 ID，可在 URL 找到' },
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
            source: ['moe.gov.cn/s78/:column/tongzhi', 'moe.gov.cn/s78/:column'],
        },
    ],
    name: '司局通知',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://www.moe.gov.cn';
    const column = ctx.req.param('column');
    const link = `${baseUrl}/s78/${column}/tongzhi/`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('#list li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), link).href,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('#moe-detail-page-set, #moeCode, .moe-detail-shuxing, h1').remove();
                item.description = $('.moe-detail-box').html();

                return item;
            })
        )
    );

    return {
        title: `${$('meta[name="ColumnType"]').attr('content')} - ${$('head title').text()}`,
        link,
        item: items,
    };
}
