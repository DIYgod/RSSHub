import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/latest/:language?',
    categories: ['new-media'],
    example: '/radio-canada/latest',
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
            source: ['ici.radio-canada.ca/rci/:lang', 'ici.radio-canada.ca/'],
        },
    ],
    name: 'Latest News',
    maintainers: ['nczitzk'],
    handler,
    description: `| Français | English | Español | 简体中文 | 繁體中文 | العربية | ਪੰਜਾਬੀ | Tagalog |
| -------- | ------- | ------- | -------- | -------- | ------- | --- | ------- |
| fr       | en      | es      | zh-hans  | zh-hant  | ar      | pa  | tl      |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://ici.radio-canada.ca';
    const apiRootUrl = 'https://services.radio-canada.ca';
    const currentUrl = `${apiRootUrl}/neuro/sphere/v1/rci/${language}/continuous-feed?pageSize=50`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.lineup.items.map((item) => ({
        title: item.title,
        category: item.kicker,
        link: `${rootUrl}${item.url}`,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(detailResponse.data);
                const rcState = $('script:contains("window._rcState_ = ")')
                    .text()
                    .match(/window\._rcState_ = (.*);/)[1];
                const rcStateJson = JSON.parse(rcState);
                const news = Object.values(rcStateJson.pagesV2.pages)[0];
                item.description = news.data.newsStory.body.html.replaceAll(String.raw`\n`, '<br>');

                return item;
            })
        )
    );

    return {
        title: response.data.meta.title,
        link: response.data.metric.metrikContent.omniture.url,
        item: items,
    };
}
