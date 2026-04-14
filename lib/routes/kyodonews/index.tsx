import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const resolveRelativeLink = (link, baseUrl) => (link.startsWith('http') ? link : `${baseUrl}${link}`);

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
        throw error.response && error.response.statusCode === 404 ? new InvalidParameterError('Invalid keyword') : error;
    }

    const $ = load(response.data, { xmlMode: keyword === 'rss' });

    let title, description, image, items;
    image = `https://${language}-kyodo.ismcdn.jp/common/images/apple-touch-icon-180x180.png`;

    if (keyword === 'rss') {
        title = $('channel > title').text();
        description = $('channel > description').text();
        items = $('item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const link = $item.find('link').text();
                // const pubDate = $item.find('pubDate').text();
                return {
                    link,
                    // pubDate,  // no need to normalize because it's from a valid RSS feed
                };
            });
    } else {
        title = $('head > title').text();
        description = $('meta[name="description"]').attr('content');
        image = resolveRelativeLink($('head > link[rel="apple-touch-icon"]').attr('href'), rootUrl) || image;
        items = $('.m-article-wrap:first-of-type .m-article-item__link')
            .toArray()
            .map((item) => {
                item = $(item);
                const link = item.attr('href');
                return {
                    link: resolveRelativeLink(link, rootUrl),
                };
            });
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const $ = load(detailResponse.data);
                item.title = $('head > title').text();
                item.author = $('meta[name="author"]').attr('content');

                // add main pic
                const mainPicArea = $('.article-header-img');
                let mainPic = mainPicArea.html();
                mainPic = mainPic ? mainPic.trim() : '';

                // add article body
                let articleBody = $('div.article-body').html();
                articleBody = articleBody ? articleBody.trim().replace(/（完）(?=<\/p>\s*$)/m, '') : '';

                // render description
                item.description = renderToString(
                    <>
                        {mainPic ? raw(mainPic) : null}
                        {articleBody ? raw(articleBody) : null}
                    </>
                );

                const ldJson = JSON.parse($('script[type="application/ld+json"]').text() || '[]').find((obj) => obj['@type'] === 'NewsArticle');
                const pubDateMatch = ldJson && ldJson.datePublished;
                const updatedMatch = ldJson && ldJson.dateModified;
                if (pubDateMatch) {
                    item.pubDate = timezone(parseDate(pubDateMatch), 9);
                }
                if (updatedMatch) {
                    item.updated = timezone(parseDate(updatedMatch), 9);
                }

                item.category = $('.article-header-cate__link')
                    .toArray()
                    .map((a) => $(a).text());
                return item;
            })
        )
    );

    return {
        title,
        description,
        link: currentUrl,
        item: items,
        image,
    };
}
