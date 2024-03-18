import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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
            source: ['who.int/director-general/speeches'],
            target: '/speeches',
        },
    ],
    name: 'Speeches',
    maintainers: ['nczitzk'],
    handler,
    url: 'who.int/director-general/speeches',
    description: `Language

  | English | العربية | 中文 | Français | Русский | Español | Português |
  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |
  | en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') || 'en';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? '' : `${language}/`}director-general/speeches`;
    const apiUrl = `${rootUrl}/api/hubs/speeches?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.sf-detail-body-wrapper').html();

                return item;
            })
        )
    );

    return {
        title: 'Speeches - WHO',
        link: currentUrl,
        item: items,
    };
}
