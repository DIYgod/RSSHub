import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/ngocn2',
    parameters: { category: '分类，见下表，默认为所有文章' },
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
            source: ['ngocn2.org/'],
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'ngocn2.org/',
    description: `| 所有文章 | 早报        | 热点     |
| -------- | ----------- | -------- |
| article  | daily-brief | trending |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'article';

    const rootUrl = 'https://ngocn2.org';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.articleroll__article a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.meta').text()),
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

                content('.gatsby-resp-image-link').each(function () {
                    content(this).html(`<img src="${content(this).find('img').attr('src')}">`);
                });

                item.description = content('.article__content').html();

                return item;
            })
        )
    );

    return {
        title: `${$('.sectitle__content').text()} - NGOCN`,
        link: currentUrl,
        item: items,
    };
}
