import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

async function getArticleDetails(link: string) {
    const detailResponse = await got({ method: 'get', url: link });
    const content = load(detailResponse.data);
    const tags = content('.sf-item-header-wrapper .sf-tags-list-item')
        .toArray()
        .map((element) => content(element).text());
    const body = content('.sf-detail-body-wrapper');
    if (!body.length) {
        throw new Error(`WHO speech content not found: ${link}`);
    }
    return {
        description: body.html(),
        category: tags.length ? tags : undefined,
    };
}
export const route: Route = {
    path: '/speeches/:language?',
    categories: ['government'],
    example: '/who/speeches',
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
            source: ['who.int/director-general/speeches', 'who.int/news-room/speeches'],
            target: '/speeches',
        },
    ],
    name: 'Speeches',
    maintainers: ['nczitzk'],
    handler,
    url: 'who.int/news-room/speeches',
    description: `Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};
async function handler(ctx) {
    const language = ctx.req.param('language') || 'en';
    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? 'news-room/speeches' : `${language}/director-general/speeches`}`;
    const apiUrl = `${rootUrl}/api/hubs/speeches?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });
    const list: Array<
        DataItem & {
            link: string;
        }
    > = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/${language === 'en' ? 'item' : 'detail'}/${item.ItemDefaultUrl.replace(/^\/+/, '')}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const details = await getArticleDetails(item.link);
                return { ...item, ...details };
            }),
        { concurrency: 3 }
    );
    return {
        title: 'Speeches - WHO',
        link: currentUrl,
        item: items,
    };
}
