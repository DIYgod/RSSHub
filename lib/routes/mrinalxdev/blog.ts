import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/mrinalxdev/blog',
    url: 'mrinalxdev.github.io/mrinalxblogs/blogs/blog.html',
    name: 'Blog',
    maintainers: ['jack-110'],
    radar: [
        {
            source: ['mrinalxdev.github.io/mrinalxblogs/blogs/blog.html', 'mrinalxdev.github.io/mrinalxblogs/'],
            target: '/blog',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://mrinalxdev.github.io/mrinalxblogs';
    const blogListUrl = `${baseUrl}/blogs/blog.html`;

    const response = await ofetch(blogListUrl);
    const $ = load(response);

    // Parse blog list - select links under list-none class
    const list = $('.list-none a')
        .toArray()
        .filter((el) => {
            const href = $(el).attr('href') || '';
            return href.includes('/blogs/') && !href.includes('blog.html');
        })
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href') || '';
            const text = $el.text().trim();

            // Extract date from link text (e.g., "2nd October, 2025 Redis 101 : From a Beginners POV")
            const dateMatch = text.match(/^(\d{1,2}(?:st|nd|rd|th)\s+\w+,\s+\d{4})\s+(.+)$/);

            let date: string | undefined;
            let title: string;

            if (dateMatch) {
                date = dateMatch[1];
                title = dateMatch[2];
            } else {
                title = text;
            }

            // Handle different URL formats - some are absolute, some are relative
            let link: string;
            if (href.startsWith('http')) {
                link = href;
            } else if (href.startsWith('/blogs/')) {
                // Relative to site root, need to add mrinalxblogs
                link = `https://mrinalxdev.github.io/mrinalxblogs${href}`;
            } else {
                link = new URL(href, blogListUrl).href;
            }

            return {
                title,
                link,
                date,
            };
        }) as Array<{ title: string; link: string; date?: string }>;

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                // Remove navigation and footer elements
                $('nav').remove();
                $('footer').remove();
                $('a[href*="buymeacoffee"]').parent().remove();

                // Extract main content - typically in body after nav
                const content = $('body').html() || '';

                const dataItem: DataItem = {
                    title: item.title,
                    link: item.link,
                    description: content,
                    author: 'Mrinal',
                };

                if (item.date) {
                    dataItem.pubDate = parseDate(item.date, 'Do MMMM, YYYY');
                }

                return dataItem;
            })
        )
    );

    return {
        title: "Mrinal's Blog",
        link: blogListUrl,
        description: 'Technical blog by Mrinal covering Redis, Distributed Systems, Algorithms, and more.',
        item: items,
    };
}
