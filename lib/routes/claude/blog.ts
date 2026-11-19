import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://claude.com';

interface ArticleMetadata {
    '@type': string | string[];
    datePublished?: string;
    dateModified?: string;
    author?: string | Array<string | { name?: string }> | { name?: string };
    articleSection?: string | string[];
}

function getArticleMetadata($: CheerioAPI): ArticleMetadata | undefined {
    for (const element of $('script[type="application/ld+json"]').toArray()) {
        let schema;
        try {
            schema = JSON.parse($(element).text());
        } catch {
            continue;
        }
        const entries = Array.isArray(schema) ? schema : (schema['@graph'] ?? [schema]);
        const article = entries.find((entry) => [entry['@type']].flat().some((type) => ['Article', 'NewsArticle', 'BlogPosting'].includes(type)));
        if (article) {
            return article;
        }
    }
}

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/claude/blog',
    parameters: {},
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
            source: ['claude.com/blog', 'claude.com/resources/articles'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['zhenlohuang'],
    handler,
    url: 'claude.com/blog',
};

async function handler(ctx) {
    const link = `${baseUrl}/resources/articles`;
    const response = await ofetch(link);
    const $ = load(response);
    const requestedLimit = ctx.req.query('limit');
    const limit = ctx.req.query('sorted') === 'false' || !requestedLimit ? getRouteLimit(ctx, 15) : undefined;

    const list: DataItem[] = $('[data-card-group="true"] > a[href]')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const title = $el.find('h3').text();
            const href = $el.attr('href')!;
            const pubDateText = $el.find('[class*="ResourceCard"][class*="__meta"]').text();
            const category = $el
                .find('[class*="ResourceCard"][class*="__productTag"]:not([class*="__moreTag"])')
                .toArray()
                .map((c) => $(c).text())
                .filter(Boolean);

            return {
                title,
                link: new URL(href, baseUrl).href,
                pubDate: pubDateText ? parseDate(pubDateText, 'MMM D, YYYY') : undefined,
                category,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const metadata = getArticleMetadata($);
                const publicationDate = metadata?.datePublished ?? $('time[datetime]').first().attr('datetime');
                if (publicationDate) {
                    item.pubDate = parseDate(publicationDate);
                }
                if (metadata?.dateModified) {
                    item.updated = parseDate(metadata.dateModified);
                }
                if (metadata?.author) {
                    item.author = [metadata.author]
                        .flat()
                        .map((author) => (typeof author === 'string' ? author : author.name))
                        .filter(Boolean)
                        .join(', ');
                }
                if (metadata?.articleSection) {
                    item.category = [...new Set([...(item.category ?? []), ...[metadata.articleSection].flat()])];
                }

                // Some cards link to anthropic.com posts, whose body is the article's `<hash>_body` block since the 2026-10 class rename
                const content = $('[class*="ArticleLayout"][class*="__content"], article[class*="MooSanityContainer"], article article, div.prose, article > div > div[class$="_body"]').first();

                if (!content.length) {
                    throw new Error(`Article content was not found at ${item.link}`);
                }

                content.find('style, script').remove();

                item.description = content.html();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Claude Blog',
        link,
        description: 'Product news and best practices for teams building with Claude.',
        language: 'en' as const,
        item: items,
    };
}
