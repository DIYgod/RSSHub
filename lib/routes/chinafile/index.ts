import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import type { Context } from 'hono';
import Parser from 'rss-parser';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(utc);
dayjs.extend(timezone);

function parseFeedDate(date?: string) {
    return date
        ? dayjs(parseDate(date.replace(' - ', ' ').replace('am', ' am').replace('pm', ' pm')))
              .tz('America/New_York', true)
              .toDate()
        : undefined;
}

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/chinafile/all',
    parameters: { category: 'Category, by default `all`' },
    name: 'Reporting & Opinion',
    maintainers: ['oppilate'],
    description: `Generates full-text feeds that the official feed doesn't provide.

| All | The China NGO Project |
| --- | --------------------- |
| all | ngo                   |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'all' } = ctx.req.param();
    const rssUrl = `https://feeds.feedburner.com/chinafile/${category}`;

    const language: Language = 'en-us';
    const icon = 'https://www.chinafile.com/sites/default/files/chinafile_favicon.png';
    const logo = 'https://www.chinafile.com/sites/all/themes/cftwo/assets/images/logos/logo-large.png';

    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);
    const feedItems = feed.items.filter((item): item is (typeof feed.items)[number] & { title: string } => item.title !== undefined);

    const items = await Promise.all(
        feedItems.map((item) =>
            cache.tryGet(item.link!, async () => {
                let response = await ofetch(item.link!);
                let $ = load(response, { scriptingEnabled: false });
                const refreshUrl = $('meta[http-equiv="refresh"]')
                    .attr('content')
                    ?.match(/url=(.*)$/i)?.[1];
                if (refreshUrl && !$('article').length) {
                    response = await ofetch(new URL(refreshUrl, item.link).href);
                    $ = load(response, { scriptingEnabled: false });
                }
                const content = $('article.prose').length ? $('article.prose').first() : $('article');

                // Cover
                const cover = $('.view-featured-photo');
                if (cover.length > 0) {
                    content.prepend(cover);
                }

                // Summary
                const summary = $('meta[name="description"]').attr('content');
                const updatedAt = $('meta[property="og:updated_time"]').attr('content');
                const publishedAt = $('meta[property="article:published_time"]').attr('content');

                const categories = $('meta[property="article:tag"]')
                    .toArray()
                    .map((el) => $(el).attr('content'))
                    .filter((tag) => tag !== undefined);

                const url = $('link[rel="canonical"]').attr('href');

                return {
                    title: item.title,
                    id: item.guid,
                    pubDate: publishedAt ? parseDate(publishedAt) : parseFeedDate(item.pubDate),
                    updated: updatedAt,
                    author: item.creator,
                    link: url,
                    summary,
                    description: content.html(),
                    category: categories,
                    icon,
                    logo,
                };
            })
        )
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        item: items,
        language,
        icon,
        logo,
    };
}
