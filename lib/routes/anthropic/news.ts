import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/anthropic/news',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/news', 'www.anthropic.com'],
        },
    ],
    name: 'News',
    maintainers: ['etShaw-zh', 'goestav'],
    handler,
    url: 'www.anthropic.com/news',
};

async function handler(ctx) {
    const link = 'https://www.anthropic.com/news';
    const response = await ofetch(link);
    const $ = load(response);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const list: DataItem[] = $('a[class*="PublicationList"]')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const title = $el.find('span[class*="title"]').text().trim() || $el.find('h3, h4').text().trim();
            const href = $el.attr('href') ?? '';
            const pubDate = $el.find('time[class*="date"]').text().trim() || $el.find('p.detail-m.agate').text().trim();
            const fullLink = href.startsWith('http') ? href : `https://www.anthropic.com${href}`;

            if (!title || !href || href === '#') {
                return null;
            }

            return {
                title,
                link: fullLink,
                pubDate,
            };
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null) as DataItem[];

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                // Extract only the actual article content without page wrapper markup
                const contentElements = $('[class*="post-text"], [class*="post-heading"], [class*="post-section"], [class*="post-subsection"], figure[class*="imageWithCaption"]');

                // Process and clean each element
                contentElements.each((_, el) => {
                    const $el = $(el);
                    // Remove all CSS module class names, keep only semantic classes
                    const classAttr = $el.attr('class');
                    if (classAttr) {
                        // Keep only simple semantic classes, remove CSS module hashes
                        const cleanClasses = classAttr
                            .split(/\s+/)
                            .filter((c) => !c.includes('__') && !c.includes('-module-'))
                            .join(' ');
                        if (cleanClasses) {
                            $el.attr('class', cleanClasses);
                        } else {
                            $el.removeAttr('class');
                        }
                    }
                });

                // Process images
                contentElements.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset loading decoding data-nimg class');
                    const src = $e.attr('src');
                    const params = new URLSearchParams(src);
                    const newSrc = params.get('/_next/image?url');
                    if (newSrc) {
                        $e.attr('src', newSrc);
                    }
                });

                // Build clean HTML
                item.description =
                    contentElements
                        .toArray()
                        .map((el) => $.html(el))
                        .join('\n') || undefined;

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic News',
        link,
        description: 'Latest news from Anthropic',
        item: out,
    };
}
