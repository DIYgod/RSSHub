import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://www.inceptionlabs.ai';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/inceptionlabs/blog',
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
            source: ['www.inceptionlabs.ai/blog'],
        },
    ],
    name: 'Blog',
    maintainers: ['zdenek-stursa'],
    handler,
    url: 'inceptionlabs.ai/blog',
};

async function handler() {
    const response = await ofetch(`${ROOT_URL}/blog`);
    const $ = load(response);

    // Use [data-framer-name="Desktop"] to target only desktop-variant cards,
    // avoiding duplicate entries from SSR breakpoint rendering (desktop/mobile).
    const posts = $('a[href^="./blog/"][data-framer-name="Desktop"]')
        .toArray()
        .map((el): DataItem | null => {
            const $el = $(el);
            const href = $el.attr('href') ?? '';

            // Skip category filter links and anchor-only links
            if (href.includes('categories') || href.includes('#')) {
                return null;
            }

            // Get title: first h6.framer-text that is not a "Read story" navigation label
            const title = $el
                .find('h6.framer-text')
                .toArray()
                .map((h6) => $(h6).text().trim())
                .find((text) => text && text !== 'Read story');

            if (!title) {
                return null;
            }

            const slug = href.replace('./blog/', '');
            const link = `${ROOT_URL}/blog/${slug}`;

            // Date/category extraction – two card layouts exist:
            //   Standard card:  [data-framer-name="Date"][0] = category (teal),
            //                   [data-framer-name="Date"][1] = plain date text
            //   Featured card:  [data-framer-name="Date"][0] = date inside <mark>,
            //                   [data-framer-name="Category"]  = category (teal, separate element)
            const dateBlocks = $el
                .find('[data-framer-name="Date"] p.framer-text')
                .toArray()
                .map((p) => $(p).text().trim());

            // Category: featured cards use data-framer-name="Category"; standard cards use dateBlocks[0]
            const categoryEl = $el.find('[data-framer-name="Category"]');
            const category = categoryEl.length > 0 ? categoryEl.first().text().trim() : (dateBlocks[0] ?? '');

            // Date: featured cards have a single Date block (the date itself); standard cards have it at index 1
            const pubDate = dateBlocks.length >= 2 ? dateBlocks[1] : (dateBlocks[0] ?? '');

            return {
                title,
                link,
                category: category ? [category] : [],
                pubDate,
            };
        })
        .filter((post): post is DataItem => post !== null);

    const items = await Promise.all(
        posts.map((post) =>
            cache.tryGet(post.link!, async () => {
                const postHtml = await ofetch(post.link!);
                const $post = load(postHtml);

                // Full article content
                const contentHtml = $post('[data-framer-name="Content"]').first().html() ?? '';

                // Author name from the first [data-framer-name="Author"] RichTextContainer
                const author = $post('[data-framer-name="Author"] p.framer-text').first().text().trim();

                return {
                    ...post,
                    description: contentHtml,
                    author,
                    pubDate: parseDate(post.pubDate as string),
                } as DataItem;
            })
        )
    );

    return {
        title: 'Inception Labs Blog',
        link: `${ROOT_URL}/blog`,
        description: 'Latest posts from the Inception Labs blog about diffusion LLMs and AI research',
        item: items,
    };
}
