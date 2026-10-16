import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import { escapeUTF8 } from 'entities/escape';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

interface ArticleSchema {
    '@type'?: string | string[];
    '@graph'?: ArticleSchema[];
    datePublished?: string;
    articleBody?: string;
    liveBlogUpdate?: Array<{ articleBody?: string }>;
    author?: Array<{ name?: string }> | { name?: string };
}

function getLiveBlogDescription(schema?: ArticleSchema) {
    return schema?.liveBlogUpdate?.flatMap((update) => (typeof update.articleBody === 'string' && update.articleBody.trim() ? `<p>${escapeUTF8(update.articleBody)}</p>` : [])).join('') || undefined;
}

function getArticleSchema(content: CheerioAPI) {
    return content('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element): ArticleSchema[] => {
            try {
                const schema: ArticleSchema | ArticleSchema[] = JSON.parse(content(element).text());
                return Array.isArray(schema) ? schema : (schema['@graph'] ?? [schema]);
            } catch {
                return [];
            }
        })
        .find((schema) => ['NewsArticle', 'LiveBlogPosting'].some((type) => (Array.isArray(schema['@type']) ? schema['@type'].includes(type) : schema['@type'] === type)));
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

                content('.roadblock').remove();
                content('.sdc-site-layout-sticky-region, .ui-vendor-checkd, .sdc-article-related-stories, .sdc-article-strapline, .sdc-site-live-on-sky').remove();
                content('.sdc-site-video').each((_, element) => {
                    const video = content(element);
                    const poster = copyNodes(video.find('.sdc-site-video__poster img').first());
                    const caption = copyNodes(video.find('.sdc-site-video__caption').first());
                    video.contents().remove();
                    video.append(poster, caption);
                });

                const description = content('.sdc-article-body, .polaris-tile-group-separator').html() ?? content('.sdc-site-video').first().html() ?? schema?.articleBody ?? getLiveBlogDescription(schema);
                const pubDate = schema?.datePublished ? parseDate(schema.datePublished) : undefined;
                const author = Array.isArray(schema?.author) ? schema.author.flatMap((author) => (author.name ? { name: author.name } : [])) : schema?.author?.name;

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

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
