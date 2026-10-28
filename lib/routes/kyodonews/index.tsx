import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const resolveRelativeLink = (link: string | undefined, baseUrl: string) => (link ? new URL(link, baseUrl).href : undefined);

export const route: Route = {
    path: '/:language?/:keyword?',
    categories: ['traditional-media'],
    example: '/kyodonews',
    parameters: { language: '语言: `china` = 简体中文 (默认), `tchina` = 繁體中文', keyword: '关键词' },
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
            source: ['china.kyodonews.net/news/:keyword', 'china.kyodonews.net/'],
            target: '/china/:keyword?',
        },
        {
            source: ['tchina.kyodonews.net/news/:keyword', 'tchina.kyodonews.net/'],
            target: '/tchina/:keyword?',
        },
    ],
    name: '最新报道',
    maintainers: ['Rongronggg9'],
    handler,
    description:
        '`keyword` 为关键词，由于共同网有许多关键词并不在主页列出，此处不一一列举，可从关键词页的 URL 的最后一级路径中提取。如 `日中关系` 的关键词页 URL 为 `https://china.kyodonews.net/news/japan-china_relationship`, 则将 `japan-china_relationship` 填入 `keyword`。特别地，当填入 `rss` 时，将从共同网官方 RSS 中抓取文章；略去时，将从首页抓取最新报道 (注意：首页更新可能比官方 RSS 稍慢)。',
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'china';
    const keyword = ctx.req.param('keyword') === 'RSS' ? 'rss' : (ctx.req.param('keyword') ?? '');

    // raise error for invalid languages
    if (!['china', 'tchina'].includes(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const rootUrl = `https://${language}.kyodonews.net`;
    const currentUrl = `${rootUrl}/${keyword ? (keyword === 'rss' ? 'list/feed/rss4news' : `news/${keyword}`) : ''}`;

    let response;
    try {
        response = await got(currentUrl);
    } catch (error) {
        throw error instanceof FetchError && error.statusCode === 404 ? new InvalidParameterError('Invalid keyword') : error;
    }

    const $ = load(response.data, { xmlMode: keyword === 'rss' });

    let title, description, image;
    let list: Array<{ link: string }>;
    image = `https://${language}-kyodo.ismcdn.jp/common/images/apple-touch-icon-180x180.png`;

    if (keyword === 'rss') {
        title = $('channel > title').text();
        description = $('channel > description').text();
        list = $('item')
            .toArray()
            .flatMap((item) => {
                const $item = $(item);
                const link = $item.find('link').text();
                return link ? { link: new URL(link, currentUrl).href } : [];
            });
    } else {
        title = $('head > title').text();
        description = $('meta[name="description"]').attr('content');
        image = resolveRelativeLink($('head > link[rel="apple-touch-icon"]').attr('href'), rootUrl) || image;
        list = $('.m-article-wrap:first-of-type .m-article-item__link')
            .toArray()
            .flatMap((item) => {
                const $item = $(item);
                const link = $item.attr('href');
                const resolvedLink = resolveRelativeLink(link, rootUrl);
                return resolvedLink ? { link: resolvedLink } : [];
            });
    }

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`kyodonews:article:v2:${item.link}`, async () => {
                const detailResponse = await got(item.link);

                const $ = load(detailResponse.data);
                const article: DataItem = {
                    title: $('head > title').text(),
                    link: item.link,
                    author: $('meta[name="author"]').attr('content'),
                };

                // add main pic
                const mainPicArea = $('.article-header-img');
                let mainPic = mainPicArea.html();
                mainPic = mainPic ? mainPic.trim() : '';

                // add article body
                let articleBody = $('div.article-body').html();
                articleBody = articleBody ? articleBody.trim().replace(/（完）(?=<\/p>\s*$)/m, '') : '';

                // render description
                article.description = renderToString(
                    <>
                        {mainPic ? raw(mainPic) : null}
                        {articleBody ? raw(articleBody) : null}
                    </>
                );

                const ldJson = JSON.parse($('script[type="application/ld+json"]').text() || '[]').find((obj) => obj['@type'] === 'NewsArticle');
                const authors = Array.isArray(ldJson?.author) ? ldJson.author : [ldJson?.author];
                article.author ||=
                    authors
                        .map((author) => (typeof author === 'string' ? author : author?.name))
                        .filter(Boolean)
                        .join(', ') || undefined;
                const pubDateMatch = ldJson && ldJson.datePublished;
                const updatedMatch = ldJson && ldJson.dateModified;
                if (pubDateMatch) {
                    article.pubDate = parseDateInTimezone(pubDateMatch, 9);
                }
                if (updatedMatch) {
                    article.updated = parseDateInTimezone(updatedMatch, 9);
                }

                article.category = $('.article-header-cate__link')
                    .toArray()
                    .map((a) => $(a).text());
                return article;
            }),
        { concurrency: 3 }
    );

    return {
        title,
        description,
        link: currentUrl,
        item: items,
        image,
    };
}
