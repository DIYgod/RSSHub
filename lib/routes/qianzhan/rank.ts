import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/analyst/rank/:type?',
    categories: ['finance'],
    example: '/qianzhan/analyst/rank/week',
    parameters: { type: '分类，见下表' },
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
            source: ['qianzhan.com/analyst', 'qianzhan.com/'],
            target: '/analyst/rank',
        },
    ],
    name: '排行榜',
    maintainers: ['moke8'],
    handler,
    url: 'qianzhan.com/analyst',
    description: `| 周排行 | 月排行 |
| ------ | ------ |
| week   | month  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') === 'week' ? 1 : 2;
    const rootUrl = 'https://www.qianzhan.com/analyst/';

    const response = await got(rootUrl);
    const $ = load(response.data);
    const links = $(`#div_hotlist ul[idx='${type}'] a`).map((_, item) => $(item).attr('href'));

    const items = await Promise.all(
        links.map((_, item) =>
            cache.tryGet(item, async () => {
                const detailResponse = await got(item);
                const $ = load(detailResponse.data);
                const description = $('#divArtBody').html();
                const title = $('#h_title').text();
                const pubDate = timezone(parseDate($('#pubtime_baidu').text().split('• ')[1], 'YYYY-MM-DD HH:mm:ss'), +8);
                const author = $('.bljjxue').text().match(/\S+/)[0];
                return {
                    title,
                    link: item,
                    description,
                    pubDate,
                    author,
                    category: $('meta[name="Keywords"]').attr('content').split(','),
                };
            })
        )
    );

    return {
        title: `前瞻经济学人 - ${type === 1 ? '周排行' : '月排行'}`,
        link: rootUrl,
        item: items,
    };
}
