import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:language?',
    categories: ['government'],
    example: '/who/news',
    parameters: { language: 'Language, see below, English by default' },
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
            source: ['who.int/news'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    url: 'who.int/news',
    description: `Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? '' : `${language}/`}news`;
    const apiUrl = `${rootUrl}/api/news/newsitems?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/item/${item.ItemDefaultUrl}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                item.description = detailResponse.data.match(/"description":"(.*)","datePublished"/)[1];

                return item;
            })
        )
    );

    return {
        title: 'News - WHO',
        link: currentUrl,
        item: items,
    };
}
