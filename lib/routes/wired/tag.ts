import { load } from 'cheerio';
import pMap from 'p-map';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Item } from './types';

const parsePublicationDate = (value: string | number | undefined) => {
    if (typeof value !== 'number' && !value) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
};
export const route: Route = {
    path: '/tag/:tag',
    example: '/wired/tag/facebook',
    parameters: { tag: 'Tag name' },
    radar: [
        {
            source: ['www.wired.com/tag/:tag/'],
        },
    ],
    name: 'Tags',
    maintainers: ['Naiqus'],
    handler,
};
async function handler(ctx) {
    const baseUrl = 'https://www.wired.com';
    const tag = ctx.req.param('tag');
    const link = `${baseUrl}/tag/${tag}/`;
    const response = await ofetch(link);
    const $ = load(response);
    const preloadedState: {
        transformed: {
            tag: {
                items: Item[];
            };
            'head.title': string;
            'head.description': string;
            logo: {
                sources: {
                    sm: {
                        url: string;
                    };
                };
            };
        };
    } = JSON.parse(
        $('script:contains("window.__PRELOADED_STATE__")')
            .text()
            .match(/window\.__PRELOADED_STATE__ = (.*);/)?.[1] ?? '{}'
    );
    const list = preloadedState.transformed.tag.items.map((item) => ({
        title: item.dangerousHed,
        description: item.dangerousDek,
        link: `${baseUrl}${item.url}`,
        pubDate: parsePublicationDate(item.date),
        author: item.contributors.author.items.map((author) => author.name).join(', '),
        category: [item.rubric.name],
    }));
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`wired:detail:v4:${item.link}`, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    const preloadedState = JSON.parse(
                        $('script:contains("window.__PRELOADED_STATE__")')
                            .text()
                            .match(/window\.__PRELOADED_STATE__ = (.*);/)?.[1] ?? '{}'
                    );
                    const headerLeadAsset = $('div[data-testid*="ContentHeaderLeadAsset"]');
                    headerLeadAsset.find('button').remove();
                    // false postive: 'some' does not exist on type 'Cheerio<Element>'
                    // oxlint-disable-next-line unicorn/prefer-array-some
                    if (headerLeadAsset.find('video')) {
                        headerLeadAsset.find('video').attr('src', $('link[rel="preload"][as="video"]').attr('href'));
                        headerLeadAsset.find('video').attr('controls', '');
                        headerLeadAsset.find('video').attr('preload', 'metadata');
                        headerLeadAsset.find('video').removeAttr('autoplay');
                    }
                    const content = $('.body__inner-container')
                        .toArray()
                        .map((el) => {
                            const $el = $(el);
                            $el.find('noscript').each((_, el) => {
                                const $e = $(el);
                                $e.replaceWith($e.html() || '');
                            });
                            return $el.html();
                        })
                        .join('');
                    return {
                        description: ($('div[class^=ContentHeaderDek]').prop('outerHTML') || '') + headerLeadAsset.prop('outerHTML') + content,
                        tags: preloadedState.transformed.article.tagCloud.tags.map((t: { tag: string }) => t.tag),
                        pubDate: parsePublicationDate($('meta[property="article:published_time"]').attr('content')),
                        updated: parsePublicationDate($('meta[property="article:modified_time"]').attr('content')),
                    };
                });
                return { ...item, pubDate: detail.pubDate ?? item.pubDate, updated: detail.updated, description: detail.description, category: [...new Set([...item.category, ...detail.tags])] };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: preloadedState.transformed['head.title'],
        description: preloadedState.transformed['head.description'],
        link,
        image: `${baseUrl}${preloadedState.transformed.logo.sources.sm.url}`,
        language: 'en' as const satisfies Language,
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
