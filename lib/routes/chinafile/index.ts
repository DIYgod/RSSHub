import { load } from 'cheerio';
import type { Context } from 'hono';
import Parser from 'rss-parser';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

    const icon = 'https://www.chinafile.com/sites/default/files/chinafile_favicon.png';
    const logo = 'https://www.chinafile.com/sites/all/themes/cftwo/assets/images/logos/logo-large.png';

    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const content = $('article');

                // Cover
                const cover = $('.view-featured-photo');
                if (cover.length > 0) {
                    cover.insertBefore(content[0].childNodes[0]);
                    cover.remove();
                }

                // Summary
                const summary = $('meta[name="description"]').attr('content');
                const updatedAt = $('meta[property="og:updated_time"]').attr('content');

                const categories = $('meta[property="article:tag"]')
                    .toArray()
                    .map((el) => $(el).attr('content'));

                const url = $('link[rel="canonical"]').attr('href');

                return {
                    title: item.title,
                    id: item.guid,
                    pubDate: parseDate(item.pubDate!.replace(' - ', ' ').replace('am', ' am').replace('pm', ' pm')),
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
        item: items as DataItem[],
        language: 'en-us' as Language,
        icon,
        logo,
    };
}
