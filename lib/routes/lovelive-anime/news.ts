import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

export const route: Route = {
    path: '/news/:option?',
    categories: ['anime'],
    example: '/lovelive-anime/news',
    parameters: { option: 'Crawl full text when `option` is `detail`.' },
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
            source: ['www.lovelive-anime.jp/', 'www.lovelive-anime.jp/news'],
            target: '/news',
        },
    ],
    name: 'Love Live! Official Website Latest NEWS',
    maintainers: ['axojhf'],
    handler,
    url: 'www.lovelive-anime.jp/',
};

async function handler(ctx) {
    const rootUrl = 'https://www.lovelive-anime.jp/news/';

    const response = await got(rootUrl);

    const $ = load(response.data);

    const pageFace = $('div.c-card.p-colum__box')
        .map((_, item) => {
            item = $(item);

            return {
                link: item.find('a.c-card__head').attr('href'),
                pubDate: item.find('span.c-card__date').text(),
                title: item.find('div.c-card__title').text(),
                // description: `${item.find('div.c-card__title').text()}<br><img src="${item.find('a.c-card__head > div > figure > img').attr('src')}">`
                description: renderDescription({
                    title: item.find('div.c-card__title').text(),
                    imglink: item.find('a.c-card__head > div > figure > img').attr('src'),
                }),
            };
        })
        .get();

    let items = pageFace;

    if (ctx.req.param('option') === 'detail') {
        items = await Promise.all(
            pageFace.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResp = await got(item.link);
                    const $ = load(detailResp.data);

                    const content = $('div.p-page__detail.p-article');
                    for (const v of content.find('img')) {
                        v.attribs.src = 'https://www.lovelive-anime.jp' + v.attribs.src;
                    }
                    item.description = content.html();
                    return item;
                })
            )
        );
    }

    return {
        title: 'lovelive official website news',
        link: 'https://www.lovelive-anime.jp/news/',
        item: items,
    };
}
