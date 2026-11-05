import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const languages = { k: 'ko', c: 'zh-CN', e: 'en', f: 'fr', g: 'de', i: 'id', j: 'ja', r: 'ru', s: 'es', v: 'vi' } satisfies Record<string, Language>;
const isLanguageKey = (key: string): key is keyof typeof languages => Object.hasOwn(languages, key);

export const route: Route = {
    path: '/today/:language?',
    categories: ['new-media'],
    example: '/kbs/today',
    parameters: { language: 'Language, see below, e as English by default' },
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
            source: ['world.kbs.co.kr/'],
            target: '/today',
        },
    ],
    name: 'Today',
    maintainers: ['nczitzk'],
    handler,
    url: 'world.kbs.co.kr/',
    description: `| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
| k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'e';

    if (!['k', 'a', 'c', 'e', 'f', 'g', 'i', 'j', 'r', 's', 'v'].includes(language)) {
        throw new InvalidParameterError(`Unknown kbs language: ${language}. Use a documented language code.`);
    }

    const rootUrl = 'http://world.kbs.co.kr';
    const currentUrl = `${rootUrl}/service/news_today.htm?lang=${language}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.comp_text_1x article')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('h2 a');
            const date = $item.find('.date').text();

            return {
                title: a.text(),
                category: $item.find('.cate').text(),
                link: `${rootUrl}/service${a.attr('href')!.replace('./', '/')}`,
                pubDate: date ? timezone(parseDate(date), 9) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`kbs:body:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                return content('.body_txt').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Latest News | KBS WORLD',
        link: currentUrl,
        language: isLanguageKey(language) ? languages[language] : undefined,
        item: items,
    };
}
