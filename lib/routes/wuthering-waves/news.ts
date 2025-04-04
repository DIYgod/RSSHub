import { Route, DataItem, Data } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Context } from 'hono';
import { ARTICLE_TYPE_NAME_MAPPING, CACHE_TTL_SECONDS, DEFAULT_LIMIT, SUPPORTED_LANGUAGES } from './constants';
import { ArticleType, Parameters } from './enum';

/* Get the content of a news article. */
const getArticleContent = (language: string, articleId: number) =>
    cache.tryGet(
        `wuthering-waves:${language}:article:${articleId}`,
        async () => {
            const response = await ofetch(`https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/${language}/article/${articleId}.json`);

            return response.articleContent as string;
        },
        CACHE_TTL_SECONDS
    );

/** Get the feed details. */
const handler = async (ctx: Context) => {
    // Prevent an accidental DOS attack since every article requires an additional request to fetch the content.
    const limitParameter = ctx.req.query(Parameters.Limit);
    const limitParsed = limitParameter ? Number.parseInt(limitParameter, 10) : DEFAULT_LIMIT;

    /** The amount of articles to fetch. */
    const limit = Number.isNaN(limitParsed) || limitParsed <= 0 ? 0 : limitParsed;

    /** The language to fetch articles in. */
    const language = ctx.req.param(Parameters.Language) ?? 'en';

    /** The category ID to filter articles on. */
    const categoryIdParameter = ctx.req.param(Parameters.Category);
    const categoryId = categoryIdParameter ? Number.parseInt(categoryIdParameter) : null;

    if (!SUPPORTED_LANGUAGES.includes(language)) {
        throw new Error(`"${language}" is not a supported language. Please choose between the following: ${SUPPORTED_LANGUAGES.join(', ')}.`);
    }

    const supportedCategoryIds = Object.values(ArticleType);

    if (categoryId && !supportedCategoryIds.includes(categoryId)) {
        throw new Error(`"${categoryIdParameter}" is not a supported category ID. Please choose between the following: ${supportedCategoryIds.join(', ')}.`);
    }

    const responseData = await ofetch(`https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/${language}/MainMenu.json`);

    /** Category IDs mapped to their name. */
    const categories = new Map(responseData.articleType.map(({ contentId, contentLabel }) => [contentId, contentLabel]) as [number, string][]);

    // Ignore duplicate articles
    const handledIds: number[] = [];

    const items: DataItem[] = [];

    for (const article of responseData.article) {
        // Limit the amount of items to display in the feed
        if (handledIds.length >= limit) {
            continue;
        }

        // Ignore duplicate articles
        if (handledIds.includes(article.articleId)) {
            continue;
        }

        // Filter on category
        if (categoryId && article.articleType !== categoryId) {
            continue;
        }

        handledIds.push(article.articleId);

        // eslint-disable-next-line no-await-in-loop
        const description = await getArticleContent(language, article.articleId);
        const category = categories.get(article.articleType);

        if (description === null) {
            logger.error(`Failed to fetch Wuthering Waves article content for article with ID ${article.articleId}`);
            continue;
        }

        if (typeof description !== 'string') {
            logger.error(`Expected Wuthering Waves article content for article with ID ${article.articleId} to be a string, but got ${typeof description} instead`);
            continue;
        }

        items.push({
            title: article.articleTitle,
            description,
            category: category ? [category] : undefined,
            pubDate: timezone(parseDate(article.createTime), 0),
            link: `https://wutheringwaves.kurogames.com/${language}/main/news/detail/${article.articleId}`,
            guid: article.articleId,
        });
    }

    const titleCategory = categoryId ? ARTICLE_TYPE_NAME_MAPPING[categoryId ?? ArticleType.News] : 'Latest';

    return {
        title: `Wuthering Waves - ${titleCategory}`,
        link: 'https://wutheringwaves.kurogames.com/en/main#news',
        item: items,
        icon: 'https://wutheringwaves.kurogames.com/favicon.ico',
        logo: 'https://wutheringwaves.kurogames.com/favicon.ico',
        // Event category for example is empty
        allowEmpty: true,
    } as Data;
};

export const route: Route = {
    path: `/:${Parameters.Language}/news/:${Parameters.Category}?`,
    categories: ['game'],
    example: `/wuthering-waves/:${Parameters.Language}/news/:${Parameters.Category}?`,
    parameters: {
        [Parameters.Language]: 'Language to fetch article information in (see table below for the supported language codes)',
        [Parameters.Category]: 'Filter articles by their category (see table below for the supported category IDs)',
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
            source: [`wutheringwaves.kurogames.com/:${Parameters.Language}/main/#news`],
            target: `/wuthering-waves/:${Parameters.Language}/news`,
        },
    ],
    name: 'News',
    maintainers: ['goestav'],
    handler,
    description: `
        Language codes for the \`${Parameters.Language}\` parameter:

        | Language | Code  |
        |----------|-------|
        | English  | en    |
        | 日本語    | jp    |
        | 한국어     | kr    |
        | 繁體中文   | zh-tw |
        | Español  | es    |
        | Français | fr    |
        | Deutsch  | de    |

        IDs for the \`${Parameters.Category}\` parameter:

        | Article Type | ID |
        |--------------|----|
        | Notice       | 58 |
        | News         | 57 |
        | Event        | 59 |
    `,
};
