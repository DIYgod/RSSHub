import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/groq/blog',
    name: 'Blog',
    maintainers: ['ljh12138164'],
    description: 'Full articles from the Groq blog, including news listed on the blog page. Fetches up to 20 entries by default.',
    radar: [{ source: ['groq.com/blog'] }],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const link = 'https://groq.com/blog';
    const page = await ofetch(link);
    const $ = load(page);
    const posts = $('[data-post-key]')
        .toArray()
        .slice(0, getRouteLimit(ctx, 20))
        .map((post) => {
            const card = $(post);
            const date = card.find('time').attr('datetime');
            const category = card.find('[class*="PostCard_pill__"]').text();
            return {
                title: card.find('h2').text(),
                link: new URL(card.attr('data-post-key')!, link).href,
                pubDate: date ? parseDate(date) : undefined,
                category: category ? [category] : undefined,
            };
        });

    const item = await pMap(
        posts,
        (post) =>
            cache.tryGet(post.link, async () => {
                const page = await ofetch(post.link);
                const $ = load(page);
                const article = $('article');
                return {
                    ...post,
                    description: article.find('[class*="ArticleLayout_body__"]').html() ?? undefined,
                    author: article.find('[class*="ArticleLayout_byline__"]').text().trim() || undefined,
                    image: $('meta[property="og:image"]').attr('content'),
                };
            }),
        { concurrency: 4 }
    );

    return { title: 'Groq Blog', link, language: 'en', item };
}
