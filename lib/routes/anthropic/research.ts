import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research',
    categories: ['programming'],
    example: '/anthropic/research',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/research', 'www.anthropic.com'],
        },
    ],
    name: 'Research',
    maintainers: ['ttttmr'],
    handler,
    url: 'www.anthropic.com/research',
};

async function handler() {
    const link = 'https://www.anthropic.com/research';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('a[class*="PublicationList"]')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('[class*="title"]').text().trim();
            const href = $el.attr('href');
            const pubDateText = $el.find('[class*="date"]').text().trim();

            if (!title || !href || href === '#') {
                return null;
            }

            return {
                title,
                link: `https://www.anthropic.com${href}`,
                pubDate: parseDate(pubDateText),
            };
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null);

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                // Extract only the actual article content without page wrapper markup
                const contentElements = $('[class*="post-text"], [class*="post-heading"], [class*="post-section"], [class*="post-subsection"], [class*="post-footnote"], figure[class*="imageWithCaption"]');

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
                    if (src) {
                        const params = new URLSearchParams(src);
                        const newSrc = params.get('/_next/image?url');
                        if (newSrc) {
                            $e.attr('src', newSrc);
                        }
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
        title: 'Anthropic Research',
        link,
        description: 'Latest research from Anthropic',
        item: items,
    };
}
