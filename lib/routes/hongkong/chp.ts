import { load } from 'cheerio';
import pMap from 'p-map';
import sanitizeHtml from 'sanitize-html';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const titles = {
    title: {
        en: 'Hong Kong Centre for Health Protection',
        zh_cn: '香港卫生防护中心',
        zh_tw: '香港衛生防護中心',
    },
    important_ft: {
        en: 'Important Topics',
        zh_cn: '重要资讯',
        zh_tw: '重要資訊',
    },
    press_data_index: {
        en: 'Press Releases',
        zh_cn: '新闻稿',
        zh_tw: '新聞稿',
    },
    ResponseLevel: {
        en: 'Response Level',
        zh_cn: '应变级别',
        zh_tw: '應變級別',
    },
    publication: {
        en: 'Periodicals & Publications',
        zh_cn: '期刊及刊物',
        zh_tw: '期刊及刊物',
    },
    HealthAlert: {
        en: 'Health Notice',
        zh_cn: '健康通告',
        zh_tw: '健康通告',
    },
};

export const route: Route = {
    path: '/chp/:category?/:language?',
    categories: ['government'],
    example: '/hongkong/chp',
    parameters: { category: 'Category, see below, Important Topics by default', language: 'Language, see below, zh_tw by default' },
    radar: [
        {
            source: ['www.chp.gov.hk/en/index.html'],
            target: '/chp/important_ft/en',
        },
        {
            source: ['www.chp.gov.hk/en/media/116/index.html'],
            target: '/chp/press_data_index/en',
        },
        {
            source: ['www.chp.gov.hk/sc/index.html'],
            target: '/chp/important_ft/zh_cn',
        },
        {
            source: ['www.chp.gov.hk/sc/media/116/index.html'],
            target: '/chp/press_data_index/zh_cn',
        },
        {
            source: ['www.chp.gov.hk/tc/index.html'],
            target: '/chp/important_ft/zh_tw',
        },
        {
            source: ['www.chp.gov.hk/tc/media/116/index.html'],
            target: '/chp/press_data_index/zh_tw',
        },
        {
            source: ['www.chp.gov.hk/'],
            target: '/chp',
        },
    ],
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.chp.gov.hk/',
    description: `Category

| Important Topics | Press Releases     | Response Level | Periodicals & Publications | Health Notice |
| ---------------- | ------------------ | -------------- | -------------------------- | ------------- |
| important\\_ft    | press\\_data\\_index | ResponseLevel  | publication                | HealthAlert   |

Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| en      | zh\\_cn   | zh\\_tw   |`,
};

async function handler(ctx) {
    const languageCodes = {
        en: 'en',
        zh_cn: 'sc',
        zh_tw: 'tc',
    };

    const category = ctx.req.param('category') ?? 'important_ft';
    const language = ctx.req.param('language') ?? 'zh_tw';
    if (!Object.hasOwn(languageCodes, language) || !Object.hasOwn(titles, category) || category === 'title') {
        throw new InvalidParameterError('Invalid category or language: use the documented CHP category and en, zh_cn, or zh_tw.');
    }

    const rootUrl = 'https://www.chp.gov.hk';
    const apiUrl = `${rootUrl}/js/${category}.js`;
    const currentUrl = `${rootUrl}/${languageCodes[language]}${category === 'press_data_index' ? '/media/116' : ''}/index.html`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = JSON.parse(response.data.match(/"data":(\[\{.*\}\])\}/)[1]).map((item) => {
        let link: string;

        if (item.UrlPath_en) {
            link = new URL(item[`UrlPath_${language}`], rootUrl).href;
        } else if (category === 'ResponseLevel' && item.FilePath_en) {
            link = new URL(item[`FilePath_${language}`], rootUrl).href;
        } else {
            link = `${rootUrl}/${languageCodes[language]}/${category === 'publication' ? 'guideline' : 'features'}/${item.InfoBlockID}.html`;
        }

        return {
            link,
            pubDate: item.PublishDate ? timezone(parseDate(item.PublishDate), 8) : undefined,
            description: item[`Content_${language}`] ?? '',
            title: sanitizeHtml(item[`Title_${language}`] ?? '', { allowedTags: [], allowedAttributes: {} }),
        };
    });

    const items = await pMap(
        list,
        (item: DataItem & { link: string }) =>
            cache.tryGet(item.link, async () => {
                if ((category === 'important_ft' || category === 'press_data_index') && (item.link.indexOf('htm') > 0 || item.link.indexOf('/features/') > 0)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    content('#btmNav').remove();
                    content('.contHeader, .title_display_date').remove();
                    content('.printBtn, .bookmarkBtn, .qrBtn, .qr-content').remove();

                    item.description = content('#mainContent, #pressrelease').html();
                }
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `${titles[category][language]} - ${titles.title[language]}`,
        link: currentUrl,
        item: items,
        language: { en: 'en', zh_cn: 'zh-CN', zh_tw: 'zh-HK' }[language] as Language,
    };
}
