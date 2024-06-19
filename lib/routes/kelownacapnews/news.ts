import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
                    pubDate: timezone(parseDate(a.find('.media-links time').attr('datetime')!), +8),
                    link: baseURL + a.attr('href'),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);

                    const details = $('.details-file');
                    item.image = details.length ? details.find('img').attr('src') : $('#sliderImgs .tablist-item:nth-child(1) img').attr('src');

                    const byline = $('.details-byline');
                    const profileTitle = byline.find('.profile-title');
                    if (profileTitle.length) {
                        item.author = profileTitle.find('a').text();
                    }

                    item.description = `<img src='${item.image}'></img>${$('.details-body').html()!}`;

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
