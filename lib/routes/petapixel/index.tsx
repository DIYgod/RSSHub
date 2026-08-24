import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://petapixel.com';

const api = (path: string, query: Record<string, string | number>) =>
    ofetch(`${baseUrl}/wp-json/wp/v2/${path}`, {
        query,
        // the default browser-like Accept header can make WordPress serve the HTML page instead of JSON
        headers: { accept: 'application/json' },
    });

// `src` points to an 800px variant; pick the largest candidate from srcset and drop browser-only attributes
const cleanContent = (html: string): string => {
    const $ = load(html, null, false);
    $('img').each((_, el) => {
        const $img = $(el);
        const srcset = $img.attr('srcset');
        if (srcset) {
            const largest = srcset
                .split(',')
                .map((candidate) => {
                    const [url, width] = candidate.trim().split(/\s+/, 2);
                    return { url, width: Number(width?.replace(/w$/, '')) || 0 };
                })
                .sort((a, b) => b.width - a.width)[0];
            if (largest?.url) {
                $img.attr('src', largest.url);
            }
        }
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('loading').removeAttr('decoding').removeAttr('width').removeAttr('height');
    });
    return $.html();
};

export const route: Route = {
    path: '/:category?',
    categories: ['picture'],
    view: ViewType.Articles,
    example: '/petapixel/news',
    parameters: { category: 'Category slug, see the table below or the URL of a topic page. All posts by default' },
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
            source: ['petapixel.com/', 'petapixel.com/topic/:category'],
            target: '/:category',
        },
    ],
    name: 'Posts',
    maintainers: ['IvanWng97'],
    handler,
    description: `The official feed only carries excerpts; this route returns the full post with all images.

| Category    | Slug           |
| ----------- | -------------- |
| News        | \`news\`         |
| Equipment   | \`equipment\`    |
| Culture     | \`culture\`      |
| Inspiration | \`inspiration\`  |
| Spotlight   | \`spotlight\`    |
| Finds       | \`finds\`        |
| Technology  | \`technology-2\` |
| Industry    | \`industry\`     |
| Software    | \`software\`     |
| Educational | \`educational\`  |
| Tips        | \`tips\`         |
| Ideas       | \`ideas\`        |
| Editorial   | \`editorial\`    |
| Mobile      | \`mobile\`       |`,
};

async function handler(ctx) {
    const categorySlug = ctx.req.param('category');
    const limit = Number(ctx.req.query('limit')) || 20;

    const category = categorySlug
        ? await cache.tryGet(`petapixel:category:${categorySlug}`, async () => {
              const data = await api('categories', { slug: categorySlug });
              if (!Array.isArray(data) || data.length === 0) {
                  throw new InvalidParameterError(`Category "${categorySlug}" not found`);
              }
              return { id: data[0].id, name: decodeHTML(data[0].name), link: data[0].link };
          })
        : undefined;

    const posts = await api('posts', {
        per_page: limit,
        _embed: 'wp:featuredmedia,wp:term,author',
        ...(category && { categories: category.id }),
    });
    if (!Array.isArray(posts)) {
        throw new TypeError(`Unexpected response from the posts API: ${JSON.stringify(posts).slice(0, 200)}`);
    }

    const items: DataItem[] = posts.map((post) => {
        const featured = post._embedded?.['wp:featuredmedia']?.find((media) => media.id === post.featured_media);
        const image = featured?.source_url;

        return {
            title: decodeHTML(post.title.rendered),
            link: post.link,
            // WordPress returns *_gmt without a timezone designator
            pubDate: parseDate(`${post.date_gmt}Z`),
            updated: parseDate(`${post.modified_gmt}Z`),
            author: post._embedded?.author?.[0]?.name,
            category: (post._embedded?.['wp:term'] ?? []).flat().map((term) => decodeHTML(term.name)),
            description: renderToString(
                <>
                    {image ? (
                        <figure>
                            <img src={image} alt={featured.alt_text || undefined} />
                            {featured.caption?.rendered ? <figcaption>{raw(featured.caption.rendered)}</figcaption> : null}
                        </figure>
                    ) : null}
                    {raw(cleanContent(post.content.rendered))}
                </>
            ),
        };
    });

    return {
        title: category ? `PetaPixel - ${category.name}` : 'PetaPixel',
        link: category?.link ?? baseUrl,
        description: 'Photography and camera news, reviews and inspiration.',
        item: items,
    };
}
