import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const languages = {
    english: 'https://sputniknews.com',
    spanish: 'https://mundo.sputniknews.com',
    german: 'https://snanews.de',
    french: 'https://fr.sputniknews.com',
    greek: 'https://sputniknews.gr',
    italian: 'https://it.sputniknews.com',
    czech: 'https://cz.sputniknews.com',
    polish: 'https://pl.sputniknews.com',
    serbian: 'https://rs.sputniknews.com',
    latvian: 'https://sputniknewslv.com',
    lithuanian: 'https://lt.sputniknews.com',
    moldavian: 'https://md.sputniknews.com',
    belarusian: 'https://bel.sputnik.by',
    armenian: 'https://armeniasputnik.am',
    abkhaz: 'https://sputnik-abkhazia.info',
    ssetian: 'https://sputnik-ossetia.com',
    georgian: 'https://sputnik-georgia.com',
    azerbaijani: 'https://sputnik.az',
    arabic: 'https://arabic.sputniknews.com',
    turkish: 'https://tr.sputniknews.com',
    persian: 'https://ir.sputniknews.com',
    dari: 'https://af.sputniknews.com',
    kazakh: 'https://sputniknews.kz',
    kyrgyz: 'https://kg.sputniknews.com',
    uzbek: 'https://oz.sputniknews-uz.com',
    tajik: 'https://sputnik-tj.com',
    vietnamese: 'https://vn.sputniknews.com',
    japanese: 'https://jp.sputniknews.com',
    chinese: 'http://sputniknews.cn',
    portuguese: 'https://br.sputniknews.com',
};

const languageCodes: Record<string, Language> = {
    english: 'en',
    spanish: 'es',
    german: 'de',
    french: 'fr',
    greek: 'el',
    italian: 'it',
    czech: 'cs',
    polish: 'pl',
    serbian: 'sr',
    moldavian: 'ro-mo',
    belarusian: 'be',
    turkish: 'tr',
    vietnamese: 'vi',
    japanese: 'ja',
    chinese: 'zh-CN',
    portuguese: 'pt-br',
};

export const route: Route = {
    path: '/:category?/:language?',
    categories: ['traditional-media'],
    example: '/sputniknews',
    parameters: { category: 'Category, can be found in URL, `news` by default', language: 'Language, see below, English by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `Categories for International site:

| WORLD | COVID-19 | BUSINESS | SPORT | TECH | OPINION |
| ----- | -------- | -------- | ----- | ---- | ------- |
| world | covid-19 | business | sport | tech | opinion |

Categories for Chinese site:

| 新闻 | 中国  | 俄罗斯 | 国际            | 俄中关系                 | 评论    |
| ---- | ----- | ------ | --------------- | ------------------------ | ------- |
| news | china | russia | category\\_guoji | russia\\_china\\_relations | opinion |

Language

| Language    | Id          |
| ----------- | ----------- |
| English     | english     |
| Spanish     | spanish     |
| German      | german      |
| French      | french      |
| Greek       | greek       |
| Italian     | italian     |
| Czech       | czech       |
| Polish      | polish      |
| Serbian     | serbian     |
| Latvian     | latvian     |
| Lithuanian  | lithuanian  |
| Moldavian   | moldavian   |
| Belarusian  | belarusian  |
| Armenian    | armenian    |
| Abkhaz      | abkhaz      |
| Ssetian     | ssetian     |
| Georgian    | georgian    |
| Azerbaijani | azerbaijani |
| Arabic      | arabic      |
| Turkish     | turkish     |
| Persian     | persian     |
| Dari        | dari        |
| Kazakh      | kazakh      |
| Kyrgyz      | kyrgyz      |
| Uzbek       | uzbek       |
| Tajik       | tajik       |
| Vietnamese  | vietnamese  |
| Japanese    | japanese    |
| Chinese     | chinese     |
| Portuguese  | portuguese  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';
    const language = ctx.req.param('language') ?? 'english';

    const rootUrl = languages[language];
    const currentUrl = `${rootUrl}/services/${category}/more.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list__title')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`sputniknews:detail:v4:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const pubDate = parseDate(Number(content('a[data-unixtime]').attr('data-unixtime')) * 1000);

                const category = content('.tag__text')
                    .toArray()
                    .map((tag) => content(tag).text());

                content('.article__meta, .article__title, .article__info, .article__quote-bg, .article__google-news, .article__footer, .m-buy, .photoview__ext-link').remove();
                content('div.article__article-info[data-type="article"]').remove();

                content('img[data-srcset]').each((_, image) => {
                    const srcset = content(image).attr('data-srcset');
                    if (srcset) {
                        content(image).attr('srcset', srcset);
                    }
                });

                return { pubDate, category, description: content('.article').html() };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: `${category} - Sputnik News`,
        link: `${rootUrl}/${category}`,
        language: languageCodes[language] ?? 'other',
        item: items,
    };
}
