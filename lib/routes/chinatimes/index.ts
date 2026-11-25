import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/chinatimes/realtimenews',
    parameters: { category: '分類，見下表，留空為 `realtimenews`' },
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
            source: ['www.chinatimes.com/:category/', 'www.chinatimes.com/'],
        },
    ],
    name: '分類',
    maintainers: ['KingJem'],
    handler,
    url: 'www.chinatimes.com/',
    description: `|     即時     |   熱門  |   政治  | 生活 | 娛樂 |  財經 |  國際 |   言論  |   兩岸  |   軍事   |   社會  |  健康  |  體育  |      科技      |   運勢  | 有影 |  寶島  |
| :----------: | :-----: | :-----: | :--: | :--: | :---: | :---: | :-----: | :-----: | :------: | :-----: | :----: | :----: | :------------: | :-----: | :--: | :----: |
| realtimenews | hotnews | politic | life | star | money | world | opinion | chinese | armament | society | health | sports | technologynews | fortune | tube | taiwan |`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.chinatimes.com';

    const category = ctx.req.param('category') ?? 'realtimenews';
    const link = `${baseUrl}/${category}/?chdtv`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.articlebox-compact')
        .toArray()
        .slice(0, getRouteLimit(ctx, 20))
        .map((item): DataItem & { category: string[] } => {
            const $item = $(item);
            const a = $item.find('.title a');
            return {
                title: a.text(),
                link: `${new URL(a.attr('href')!, baseUrl).href}?chdtv`,
                guid: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate($item.find('time').attr('datetime')!, 8),
                category: $item
                    .find('.category a')
                    .toArray()
                    .map((i) => $(i).text()),
            };
        });

    const items = await Promise.all(
        list.map((item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'chinatimes.com')) {
                return item;
            }
            return cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                item.category = [
                    ...new Set([
                        ...[item.category].flat(),
                        ...$('.article-hash-tag a')
                            .toArray()
                            .map((i) => $(i).text()),
                    ]),
                ];

                $('.ad, #donate-form-container, .promote-word, .google-news-promote, .article-hash-tag').remove();

                item.description = $('.main-figure').html()! + $('.article-body').html()!;

                return item;
            });
        })
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        language: $('html').attr('lang') as Language,
        image: `${baseUrl}/images/2020/apple-touch-icon.png`,
        item: items,
    };
}
