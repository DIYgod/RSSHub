import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { processContent } from './utils';

const languageMap = { en: 'en', zh: 'zh-CN', 'zh-tw': 'zh-TW', ko: 'ko', ja: 'ja' } satisfies Record<string, Language>;

export const route: Route = {
    path: '/:lang/:category?',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/pixivision/zh-tw',
    parameters: { lang: 'Language', category: 'Category' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['SnowAgar25'],
    description: `::: tip
\`https://www.pixivision.net/zh-tw/c/interview\` → \`/pixivision/zh-tw/interview\`
:::`,
    radar: [
        {
            source: ['www.pixivision.net/:lang'],
            target: '/:lang',
        },
        {
            source: ['www.pixivision.net/:lang/c/:category'],
            target: '/:lang/:category',
        },
    ],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { lang, category } = ctx.req.param();
    const baseUrl = 'https://www.pixivision.net';
    const url = category ? `${baseUrl}/${lang}/c/${category}` : `${baseUrl}/${lang}`;

    const headers = {
        headers: {
            Cookie: `user_lang=${lang.replace('-', '_')}`, // zh-tw → zh_tw
        },
    };

    const { data: response } = await got(url, headers);
    const $ = load(response);

    const list = $('li.article-card-container a[data-gtm-action="ClickTitle"]')
        .toArray()
        .map((elem) => ({
            title: $(elem).text(),
            link: new URL($(elem).attr('href') ?? '', baseUrl).href,
        }));

    const items = await pMap(
        list,
        async (item): Promise<DataItem> => {
            const detail = await cache.tryGet(`pixivision:article:v3:${item.link}`, async () => {
                const { data: articleData } = await got(item.link, headers);
                const $article = load(articleData);

                const processedDescription = processContent($article, lang);
                const date = $article('time').attr('datetime');

                return {
                    description: processedDescription,
                    pubDate: date ? parseDate(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date) : undefined,
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `${$('.ssc__header').length ? $('.ssc__header').text() : 'New'} - pixivision`,
        link: url,
        language: languageMap[lang],
        item: items.filter((item): item is DataItem => !!item),
    };
}
