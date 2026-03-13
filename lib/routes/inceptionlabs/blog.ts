import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://www.inceptionlabs.ai';

export const route: Route = {
    path: '/blog',
    categories: ['technology'],
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
            source: ['www.inceptionlabs.ai/blog', 'inceptionlabs.ai/blog'],
        },
    ],
    name: 'Blog',
    maintainers: [],
    handler,
    url: 'inceptionlabs.ai/blog',
};

interface PostMeta {
    title: string;
    link: string;
    category: string;
    pubDate: string;
}

async function handler() {
    const response = await ofetch(`${ROOT_URL}/blog`);
    const $ = load(response);

    // Collect blog post cards from listing page.
    // The page has SSR breakpoint variants (desktop/mobile), so entries appear multiple times.
    // We deduplicate by link, keeping the first occurrence that has a real title.
    const seen = new Set<string>();
    const posts: PostMeta[] = [];

    $('a[href^="./blog/"]').each((_, el) => {
        const href = $(el).attr('href') ?? '';

        // Skip category filter links and anchor links
        if (href.includes('categories') || href.includes('#')) {
            return;
        }

        // Get title: first h6.framer-text that is not a "Read story" navigation label
        let title = '';
        $(el)
            .find('h6.framer-text')
            .each((_, h6El) => {
                const text = $(h6El).text().trim();
                if (!title && text && text !== 'Read story') {
                    title = text;
                }
            });

        if (!title) {
            return;
        }

        const slug = href.replace('./blog/', '');
        const link = `${ROOT_URL}/blog/${slug}`;

        // Deduplicate AFTER confirming the card has a real title,
        // so that banner anchors (without title) don't block the actual card.
        if (seen.has(link)) {
            return;
        }
        seen.add(link);

        // Date/category extraction – two card layouts exist:
        //   Standard card:  [data-framer-name="Date"][0] = category (teal),
        //                   [data-framer-name="Date"][1] = plain date text
        //   Featured card:  [data-framer-name="Date"][0] = date inside <mark>,
        //                   [data-framer-name="Category"]  = category (teal, separate element)
        const dateBlocks: string[] = [];
        $(el)
            .find('[data-framer-name="Date"] p.framer-text')
            .each((_, p) => {
                dateBlocks.push($(p).text().trim());
            });

        // Category: featured cards use data-framer-name="Category"; standard cards use dateBlocks[0]
        const categoryEl = $(el).find('[data-framer-name="Category"]');
        const category = categoryEl.length > 0 ? categoryEl.first().text().trim() : (dateBlocks[0] ?? '');

        // Date: featured cards have a single Date block (the date itself); standard cards have it at index 1
        const pubDate = dateBlocks.length >= 2 ? dateBlocks[1] : (dateBlocks[0] ?? '');

        posts.push({ title, link, category, pubDate });
    });

    const items = await Promise.all(
        posts.map((post) =>
            cache.tryGet(post.link, async () => {
                const postHtml = await ofetch(post.link);
                const $post = load(postHtml);

                // Full article content
                const contentHtml = $post('[data-framer-name="Content"]').first().html() ?? '';

                // Author name from the first [data-framer-name="Author"] RichTextContainer
                const author = $post('[data-framer-name="Author"] p.framer-text').first().text().trim();

                return {
                    title: post.title,
                    link: post.link,
                    description: contentHtml,
                    author,
                    pubDate: parseDate(post.pubDate),
                    category: post.category ? [post.category] : [],
                };
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
