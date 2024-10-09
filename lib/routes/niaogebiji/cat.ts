import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cat/:cat',
    categories: ['new-media'],
    example: '/niaogebiji/cat/103',
    parameters: { cat: '如 https://www.niaogebiji.com/cat/103，最后的数字就是id' },
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
            source: ['niaogebiji.com/cat/:cat'],
        },
    ],
    name: '分类目录',
    maintainers: ['cKotoriKat'],
    handler,
    url: 'niaogebiji.com/',
};

async function handler(ctx) {
    const categoryId = ctx.req.param('cat');
    const link = `https://www.niaogebiji.com/cat/${categoryId}`;

    const response = await got(link);
    const $ = load(response.data);
    const catName = $('h1').text();

    const articles = $('div.articleBox.clearfix')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.articleTitle').text().trim(),
                description: item.find('.articleContentInner').text().trim(),
                author: item.find('.author').text().trim(),
                link: new URL(item.find('a').first().attr('href'), link).href,
                category: [
                    ...item
                        .find('.art_tag')
                        .toArray()
                        .map((tag) => $(tag).text().trim()),
                    catName,
                ],
            };
        });

    const items = await Promise.all(
        articles.map((element) =>
            cache.tryGet(element.link, async () => {
                const response = await got(element.link);
                const $ = load(response.data);

                element.pubDate = timezone(parseDate($('.writeTime3').text().trim()), 8);
                element.description = $('.pc_content').html();

                return element;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    };
}
