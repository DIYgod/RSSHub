import path from 'node:path';

import { load } from 'cheerio';

import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
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
    name: '最新报道',
    maintainers: ['Rongronggg9'],
    handler,
    description: `\`keyword\` 为关键词，由于共同网有许多关键词并不在主页列出，此处不一一列举，可从关键词页的 URL 的最后一级路径中提取。如 \`日中关系\` 的关键词页 URL 为 \`https://china.kyodonews.net/news/japan-china_relationship\`, 则将 \`japan-china_relationship\` 填入 \`keyword\`。特别地，当填入 \`rss\` 时，将从共同网官方 RSS 中抓取文章；略去时，将从首页抓取最新报道 (注意：首页更新可能比官方 RSS 稍慢)。`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'china';
    const keyword = ctx.req.param('keyword') === 'RSS' ? 'rss' : (ctx.req.param('keyword') ?? '');

    // raise error for invalid languages
    if (!['china', 'tchina'].includes(language)) {
        throw new ConfigNotFoundError('Invalid language');
    }

    const rootUrl = `https://${language}.kyodonews.net`;
    const currentUrl = `${rootUrl}/${keyword ? (keyword === 'rss' ? 'rss/news.xml' : `news/${keyword}`) : ''}`;

    let response;
    try {
        response = await got(currentUrl);
    } catch (error) {
        throw error.response && error.response.statusCode === 404 ? new InvalidParameterError('Invalid keyword') : error;
    }

    const $ = load(response.data, { xmlMode: keyword === 'rss' });

    let title, description, image, items;
    image = `${rootUrl}/apple-touch-icon-180x180.png`;

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
        items = $('div.sec-latest > ul > li')
            .toArray()
            .map((item) => {
                item = $(item);
                const link = item.find('a').attr('href');
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
                const mainPicArea = $('div.mainpic');
                mainPicArea.find('div').each((_, elem) => {
                    elem = $(elem);
                    elem.css('text-align', 'center');
                });
                // moving `data-src` to `src`
                mainPicArea.find('img').each((_, img) => {
                    img = $(img);
                    img.attr('src', img.attr('data-src'));
                    img.removeAttr('data-src');
                    img.wrap('<div>');
                });
                let mainPic = mainPicArea.html();
                mainPic = mainPic ? mainPic.trim() : '';

                // add article body
                let articleBody = $('div.article-body').html();
                articleBody = articleBody ? articleBody.trim().replace(/（完）(?=<\/p>\s*$)/m, '') : '';

                // render description
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    mainPic,
                    articleBody,
                });

                const ldJson = $('script[type="application/ld+json"]').html();
                const pubDate_match = ldJson && ldJson.match(/"datePublished":"([\d\s-:]*?)"/);
                const updated_match = ldJson && ldJson.match(/"dateModified":"([\d\s-:]*?)"/);
                if (pubDate_match) {
                    item.pubDate = timezone(parseDate(pubDate_match[1]), 9);
                }
                if (updated_match) {
                    item.updated = timezone(parseDate(updated_match[1]), 9);
                }

                item.category = $('p.credit > a')
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
