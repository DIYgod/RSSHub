import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type',
    categories: ['new-media'],
    example: '/kelownacapnews/local-news',
    parameters: { type: 'Type of news' },
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
            source: ['www.kelownacapnews.com/:type'],
            target: '/:type',
        },
    ],
    name: 'News',
    maintainers: ['hualiong'],
    url: 'www.kelownacapnews.com',
    description: `\`type\` is as follows:
  
| News type     | Value         | News type    | Value        |
| ------------- | ------------- | ------------ | ------------ |
| News          | news          | Sports       | sports       |
| Local News    | local-news    | Business     | business     |
| Canadian News | national-news | Trending Now | trending-now |
| World News    | world-news    | Opinion      | opinion      |
| Entertainment | entertainment |              |              |`,
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const baseURL = 'https://www.kelownacapnews.com';

        const response = await ofetch(`${baseURL}/${type}`);
        const $ = load(response);

        const list = $('.media')
            .toArray()
            .map((item): DataItem => {
                const a = $(item);
                return {
                    title: a.find('.media-heading').text(),
                    pubDate: parseDate(a.find('.media-links time').attr('datetime')!),
                    link: baseURL + a.attr('href'),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);

                    let image = $('.details-file')!;
                    if (!image.length) {
                        image = $('#sliderImgs .tablist-item .galleryWrap');
                    }
                    const byline = $('.details-byline');
                    const profileTitle = byline.find('.profile-title');
                    if (profileTitle.length) {
                        item.author = profileTitle.find('a').text();
                    }
                    let label = '';
                    if (image.length > 1) {
                        for (const e of image.toArray()) {
                            const img = $(e);
                            label += `<figure style="margin: 10px 0 0 0"><img src='${img.data('src')}' /><figcaption>${img.attr('title')}</figcaption></figure>`;
                        }
                    } else {
                        label = `<figure style="margin: 0">${image.html()!}</figure>`;
                    }
                    item.description = label + $('.details-body').html()!;

                    return item;
                })
            )
        );

        return {
            title: `${$('.body-title').text()} - Kelowna Capital News`,
            link: `${baseURL}/${type}`,
            item: items as DataItem[],
        };
    },
};
