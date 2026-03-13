import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news-room/:category?/:language?',
    categories: ['government'],
    example: '/who/news-room/feature-stories',
    parameters: { category: 'Category, see below, Feature stories by default', language: 'Language, see below, English by default' },
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
            source: ['who.int/news-room/:type'],
            target: '/news-room/:type',
        },
    ],
    name: 'Newsroom',
    maintainers: ['LogicJake', 'nczitzk'],
    handler,
    url: 'who.int/news',
    description: `Category

| Feature stories | Commentaries |
| --------------- | ------------ |
| feature-stories | commentaries |

  Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'feature-stories';
    const language = ctx.req.param('language') ?? '';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language ? `${language}/` : ''}news-room/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let list = $('.list-view--item a');

    if (list.length === 0) {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/hubs/${category.replaceAll('-', '')}?sf_culture=zh&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl&$top=30`,
        });

        list = response.data.value.map((item) => ({
            title: item.Title,
            link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
            pubDate: parseDate(item.PublicationDateAndTime),
        }));
    } else {
        list = list.toArray().map((item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                link: `${link.indexOf('http') === 0 ? '' : rootUrl}${item.attr('href')}`,
            };
        });
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const matches = detailResponse.data.match(/"headline":"(.*)","description":"(.*)","datePublished":"(.*)","image"/);

                if (matches) {
                    item.title = matches[1];
                    item.description = matches[2];
                    item.pubDate = parseDate(matches[3]);
                } else {
                    const content = load(detailResponse.data);

                    item.description = content('.sf-content-block').html();
                }

                return item;
            })
        )
    );

    return {
        title: `${$('meta[property="og:title"]').attr('content')} - WHO`,
        link: currentUrl,
        item: items,
    };
}
