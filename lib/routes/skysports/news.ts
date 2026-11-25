import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { escapeUTF8 } from 'entities/escape';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

interface ArticleSchema {
    '@type'?: string;
    datePublished?: string;
    liveBlogUpdate?: Array<{ articleBody: string }>;
    author?: { name?: string };
}

function getLiveBlogDescription(schema?: ArticleSchema) {
    return schema?.liveBlogUpdate?.flatMap((update) => (update.articleBody.trim() ? `<p>${escapeUTF8(update.articleBody)}</p>` : [])).join('');
}

function getArticleSchema(content: CheerioAPI): ArticleSchema {
    return JSON.parse(content('script[type="application/ld+json"]:contains("NewsArticle"), script[type="application/ld+json"]:contains("LiveBlogPosting")').text());
}

export const route: Route = {
    path: '/news/:team',
    categories: ['sport'],
    example: '/skysports/news/ac-milan',
    parameters: { team: 'Team id, can be found in URL to the team page' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('team');

    const rootUrl = 'https://www.skysports.com';
    const currentUrl = `${rootUrl}/${team}-news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.news-list__headline-link, .sdc-site-tile__headline-link')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`skysports:article:v5:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const schema = getArticleSchema(content);

                content('.sdc-site-layout-sticky-region, .ui-vendor-checkd, .sdc-article-related-stories, .sdc-article-strapline').remove();
                content('.sdc-site-video').each((_, element) => {
                    const video = content(element);
                    const poster = video.find('.sdc-site-video__poster img');
                    const caption = video.find('.sdc-site-video__caption');
                    video.empty();
                    video.append(poster, caption);
                });

                const description = content('.sdc-article-body, .polaris-tile-group-separator').html() ?? content('.sdc-site-video').html() ?? getLiveBlogDescription(schema);
                const pubDate = schema?.datePublished ? parseDate(schema.datePublished) : undefined;
                const author = schema?.author?.name;

                return { description, pubDate, author };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
