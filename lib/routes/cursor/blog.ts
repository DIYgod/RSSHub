import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import { isValidHost } from '@/utils/valid-host';

const getBlogContent = (url: string) =>
    cache.tryGet(`cursor:blog:${url}`, async () => {
        const response = await ofetch(url);
        const $ = load(response);
        const article = $('.prose--blog, main article .prose').first();
        if (!article.length) {
            throw new Error(`Cursor blog article content was not found at ${url}`);
        }

        const description = article.html() ?? undefined;
        article.find('script, style').remove();

        return {
            description,
            content: {
                html: description,
                text: article.text(),
            },
        };
    });

export const handler = async (ctx: Context): Promise<Data> => {
    const { topic, locale } = ctx.req.param();
    if (locale && !isValidHost(locale)) {
        throw new InvalidParameterError('Invalid locale');
    }

    const requestedLimit = getRouteLimit(ctx, 10);
    const limit = ctx.req.query('sorted') === 'false' ? requestedLimit : Math.max(10, requestedLimit);

    const baseUrl = 'https://cursor.com';
    const normalizedTopic = topic === 'all' ? undefined : topic;
    const localeSegment = locale ? `/${locale}` : '';
    const path = normalizedTopic ? `${localeSegment}/blog/topic/${normalizedTopic}` : `${localeSegment}/blog`;
    const targetUrl = new URL(path, baseUrl).href;

    const html = await ofetch(targetUrl);
    const $ = load(html);

    const main = $('#main').last(); // there are two main tags before hydration
    const list = main
        .find('article')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const descendantLink = $el.find('a').first();
            const $link = descendantLink.length ? descendantLink : $el.closest('a');

            const title = $el.find('p').first().text();
            const description = $el.find('p').eq(1).text();
            const timeEl = $el.find('time');
            const pubDateStr = timeEl.attr('datetime') || timeEl.text();
            const pubDate = pubDateStr ? parseDate(pubDateStr) : undefined;

            const href = $link.attr('href');
            const link = href ? new URL(href, baseUrl).href : undefined;

            return {
                title,
                description,
                pubDate,
                link,
            };
        })
        .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index)
        .slice(0, limit);
    const orderedList = ctx.req.query('sorted') === 'false' ? list : list.toSorted((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));
    const candidates = orderedList.slice(0, requestedLimit);
    const items = await Promise.all(
        candidates.map(async (item) => {
            if (!item.link || new URL(item.link).hostname !== 'cursor.com') {
                return item;
            }
            return { ...item, ...(await getBlogContent(item.link)) };
        })
    );

    return {
        title: $('title').text() || 'Cursor Blog',
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        language: $('html').attr('lang') as Language | undefined,
    };
};

export const route: Route = {
    path: '/blog/:topic?/:locale?',
    name: 'Blog',
    url: 'cursor.com',
    maintainers: ['johan456789'],
    example: '/cursor/blog',
    parameters: {
        locale: 'Locale appended to the route path, e.g. `ja`',
        topic: 'Topic: all | product | research | company | news',
    },
    description: undefined,
    categories: ['blog'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cursor.com/blog'],
            target: '/blog',
        },
        {
            source: ['cursor.com/blog/topic/:topic'],
            target: '/blog/:topic',
        },
        {
            source: ['cursor.com/:locale/blog'],
            target: '/blog/all/:locale',
        },
        {
            source: ['cursor.com/:locale/blog/topic/:topic'],
            target: '/blog/:topic/:locale',
        },
    ],
    view: ViewType.Articles,
    handler,
};
