import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dh/:language?',
    categories: ['government'],
    example: '/hongkong/dh',
    parameters: { language: 'Language, see below, tc_chi by default' },
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
            source: ['dh.gov.hk/'],
        },
    ],
    name: 'Press Release',
    maintainers: ['nczitzk'],
    handler,
    url: 'dh.gov.hk/',
    description: `Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| english | chs      | tc\\_chi  |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'tc_chi';
    const languageCodes = { english: 'en', chs: 'sc', tc_chi: 'tc' };
    if (!Object.hasOwn(languageCodes, language)) {
        throw new InvalidParameterError('Invalid language: expected english, chs, or tc_chi.');
    }

    const rootUrl = 'https://www.dh.gov.hk';
    const currentUrl = `${rootUrl}/${language}/press/press.html`;
    const textonlyUrl = `${rootUrl}/textonly/${language}/press/press.html`;

    const response = await got({
        method: 'get',
        url: textonlyUrl,
    });

    const $ = load(response.data);

    const languageCode = languageCodes[language];
    const { data } = await got(`${rootUrl}/data_pr.json`);
    const list = data.map((item): DataItem => {
        const publishedDate = item[`date_${languageCode}`];
        return {
            title: item[`name_${languageCode}`],
            link: new URL(item[`link_${languageCode}`], currentUrl).href,
            pubDate: publishedDate ? timezone(parseDate(publishedDate, language === 'english' ? 'D-MMMM-YYYY' : 'YYYY年M月D日'), 8) : undefined,
        };
    });

    const items = await pMap(
        list,
        (item: DataItem) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link!);
                const content = load(detailResponse.data);
                return { ...item, description: content('#pressrelease').html() };
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        language: { english: 'en', chs: 'zh-CN', tc_chi: 'zh-HK' }[language] as Language,
    };
}
