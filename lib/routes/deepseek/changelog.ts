import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://api-docs.deepseek.com';
const ARTICLE_CONTENT_SELECTOR = '.theme-doc-markdown > div > div';

const getUpdatesUrl = (language: string | undefined) => `${ROOT_URL}${language === 'en' ? '' : '/zh-cn'}/updates/`;

export const extractChangelogItems = ($: CheerioAPI, updatesUrl: string): DataItem[] =>
    $(`${ARTICLE_CONTENT_SELECTOR} > h2`)
        .toArray()
        .map((heading) => {
            const $heading = $(heading);
            const date = $heading.text().match(/\d{4}-\d{2}-\d{2}/)?.[0];
            const $content = $heading.nextUntil('hr, h2');
            const $title = $content.filter('h3').first();
            const anchor = $title.attr('id') ?? $heading.attr('id');

            return {
                title: $title.text(),
                link: anchor ? `${updatesUrl}#${anchor}` : updatesUrl,
                ...(date && { pubDate: parseDate(date) }),
                description:
                    $content
                        .not('h3')
                        .toArray()
                        .map((element) => $.html(element))
                        .join('') || undefined,
            };
        })
        .filter((item) => item.title);

const handler = async (ctx: Context): Promise<Data> => {
    const language = ctx.req.param('language');
    const updatesUrl = getUpdatesUrl(language);
    const response = await ofetch(updatesUrl);
    const $ = load(response);

    return {
        title: language === 'en' ? 'DeepSeek Change Log' : 'DeepSeek 更新日志',
        link: updatesUrl,
        item: extractChangelogItems($, updatesUrl),
        language: language === 'en' ? 'en' : 'zh-CN',
    };
};

export const route: Route = {
    path: '/changelog/:language?',
    categories: ['program-update'],
    example: '/deepseek/changelog',
    parameters: {
        language: 'Language, use `en` for English; defaults to Chinese',
    },
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
            source: ['api-docs.deepseek.com/updates'],
            target: '/changelog/en',
        },
        {
            source: ['api-docs.deepseek.com/zh-cn/updates'],
            target: '/changelog',
        },
    ],
    name: 'Change Log',
    maintainers: ['ljh12138164'],
    handler,
    url: 'api-docs.deepseek.com',
    description: 'DeepSeek API change log in Chinese and English.',
    zh: {
        name: '更新日志',
        parameters: {
            language: '语言，可选 `en`，默认为中文',
        },
        description: 'DeepSeek API 更新日志，支持中文和英文。',
    },
};
