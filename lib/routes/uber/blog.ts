import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.uber.com';
const listPageUrl = `${rootUrl}/us/en/blog/engineering/`;
const articleFeedStateIdPrefix = '__LOCAL_REDUX_STATE_Newsroom_Article Feed Store_';
const contentSelector = 'div[data-testid="content"].rich-lfc-content';
const articleDatePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/;
const requestOptions = {
    headers: {
        accept: 'text/html',
    },
    redirect: 'manual' as const,
};

export const route: Route = {
    // `compat` is a never used parameter
    // just for backward compatibility with the deprecated `:maxPage` parameter
    path: '/blog/:compat?',
    categories: ['blog'],
    example: '/uber/blog',
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
            source: ['www.uber.com/:country/:language/blog/engineering'],
            target: '/blog',
        },
    ],
    name: 'Engineering',
    maintainers: ['hulb'],
    handler,
    url: 'www.uber.com/us/en/blog/engineering/',
    description: `The English blog on any of Uber's regional sites (e.g., [www.uber.com/en-JP/blog](http://www.uber.com/en-JP/blog)) is the same engineering blog provided by this route, so language selection is not supported. This route is not for the public news blog on specific regional sites (e.g., [www.uber.com/ja-JP/blog](http://www.uber.com/ja-JP/blog)).`,
    zh: {
        description:
            'uber 的任何区域站点的英文 blog（例如 [www.uber.com/en-JP/blog](http://www.uber.com/en-JP/blog)）都是相同的内容，正是本路由提供的 engineering blog，因此本路由不提供语言选择；本路由不是 uber 在特定区域站点的公开新闻 blog（例如 [www.uber.com/ja-JP/blog](http://www.uber.com/ja-JP/blog)）',
    },
};

type Article = {
    categoryIDs: Array<number | string>;
    fullURL: string;
    ogTitle?: string;
    publishedAt: string;
    title: string;
};

type ArticleFeedState = {
    listCategories: {
        newsroomCategories: Array<{
            ID: number | string;
            name: string;
        }>;
    };
    relatedPages: {
        relatedPages: Article[];
    };
};

function resolveArticleUrl(fullURL: string) {
    if (!fullURL.trim()) {
        throw new TypeError('Missing required Uber Engineering article URL');
    }

    const articleUrl = new URL(fullURL.startsWith('www.uber.com/') ? `https://${fullURL}` : fullURL, rootUrl);
    if (articleUrl.origin !== rootUrl) {
        throw new TypeError('Invalid Uber Engineering article URL');
    }

    return articleUrl.href;
}

function parseArticleDate(publishedAt: string) {
    const match = articleDatePattern.exec(publishedAt);
    if (!match) {
        throw new TypeError('Invalid Uber Engineering article publication date');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() || hour > 23 || minute > 59 || second > 59) {
        throw new TypeError('Invalid Uber Engineering article publication date');
    }

    const pubDate = parseDate(publishedAt);
    if (Number.isNaN(pubDate.getTime())) {
        throw new TypeError('Invalid Uber Engineering article publication date');
    }

    return pubDate;
}

async function handler() {
    const response = await ofetch(listPageUrl, requestOptions);
    const $ = load(response);
    const scriptText = $('script')
        .filter((_, element) => Boolean($(element).attr('id')?.startsWith(articleFeedStateIdPrefix)))
        .first()
        .text();

    if (!scriptText) {
        throw new Error('Unable to extract Uber Engineering article list from page state');
    }

    let articleFeedState: ArticleFeedState;
    try {
        articleFeedState = JSON.parse(decodeURIComponent(scriptText)) as ArticleFeedState;
        if (
            !Array.isArray(articleFeedState.listCategories?.newsroomCategories) ||
            !Array.isArray(articleFeedState.relatedPages?.relatedPages) ||
            articleFeedState.relatedPages.relatedPages.some(
                (article) =>
                    typeof article?.fullURL !== 'string' ||
                    typeof article?.title !== 'string' ||
                    (article?.ogTitle !== undefined && typeof article.ogTitle !== 'string') ||
                    typeof article?.publishedAt !== 'string' ||
                    !Array.isArray(article?.categoryIDs) ||
                    article.categoryIDs.some((id) => typeof id !== 'string' && typeof id !== 'number')
            ) ||
            articleFeedState.listCategories.newsroomCategories.some((category) => (typeof category?.ID !== 'string' && typeof category?.ID !== 'number') || typeof category?.name !== 'string')
        ) {
            throw new TypeError('Missing required Uber Engineering article list data');
        }
        for (const article of articleFeedState.relatedPages.relatedPages) {
            resolveArticleUrl(article.fullURL);
            parseArticleDate(article.publishedAt);
        }
    } catch {
        throw new Error('Unable to extract Uber Engineering article list from page state');
    }

    const categoryNameById = new Map(articleFeedState.listCategories.newsroomCategories.map((category) => [category.ID, category.name]));
    const item = await Promise.all(
        articleFeedState.relatedPages.relatedPages.map((article) => {
            const link = resolveArticleUrl(article.fullURL);
            const category = article.categoryIDs.map((id) => categoryNameById.get(id)).filter((name): name is string => Boolean(name));

            return cache.tryGet(link, async () => {
                const response = await ofetch(link, requestOptions);
                const detail = load(response);
                const description = detail(contentSelector).first().html();

                if (!description?.trim()) {
                    throw new Error(`Unable to extract Uber Engineering article content from ${link}`);
                }

                return {
                    title: article.ogTitle || article.title,
                    link,
                    description,
                    pubDate: parseArticleDate(article.publishedAt),
                    category,
                };
            });
        })
    );

    return {
        title: 'Uber Engineering Blog',
        link: listPageUrl,
        description: 'The technology behind Uber Engineering',
        item,
    };
}
