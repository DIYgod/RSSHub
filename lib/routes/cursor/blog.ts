import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { topic, locale } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl = 'https://cursor.com';
    const normalizedTopic = topic === 'all' ? undefined : topic;
    const localeSegment = locale ? `/${locale}` : '';
    const path = normalizedTopic ? `${localeSegment}/blog/topic/${normalizedTopic}` : `${localeSegment}/blog`;
    const targetUrl = new URL(path, baseUrl).href;

    const html = await ofetch(targetUrl);
    const $ = load(html);

    const main = $('#main').last(); // there are two main tags before hydration
    const items = main
        .find('article')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $link = $el.find('a').first();

            const title = $link.find('p').first().text().trim();
            const description = $link.find('p').eq(1).text().trim();
            const pubDate = parseDate($el.find('time').first().text().trim());

            const href = $link.attr('href');
            const link = href ? new URL(href, baseUrl).href : undefined;

            return {
                title,
                description,
                pubDate,
                link,
            };
        });

    return {
        title: $('title').text() || 'Cursor Blog',
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
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
