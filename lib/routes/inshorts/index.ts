import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/:category?',
    categories: ['technology', 'world'],
    example: '/inshorts/technology',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'inshorts',
    maintainers: [],
    handler,
    url: 'inshorts.com',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'technology';
    const rootUrl = 'https://inshorts.com';
    const currentUrl = `${rootUrl}/en/read/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'utf-8'));

    const items = $('div[itemprop="articleBody"]')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.parent().prev();

            // 图片
            const backgroundImage = item.parent().parent().parent().prev().children().css('background-image');
            const regex = /url\(["']?(.*?)["']?\)/;
            const match = backgroundImage.match(regex);
            const imageURL = match ? match[1] : null;
            return {
                title: `${title.find('span[itemprop="headline"]').text()} `,
                pubDate: title.find('span[itemprop="datePublished"]').attr('content'),
                description: `<img src=${imageURL}><br/>${item.html()}<hr>`,
            };
        });

    return {
        title: `inshorts-${category}`,
        link: currentUrl,
        item: items,
    };
}
