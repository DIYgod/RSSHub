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

const baseUrl = 'https://kosmofoto.com';

const api = (path: string, query: Record<string, string | number>) =>
    ofetch(`${baseUrl}/wp-json/wp/v2/${path}`, {
        query,
        // the default browser-like Accept header can make WordPress serve the HTML page instead of JSON
        headers: { accept: 'application/json' },
    });

// Images are served through Jetpack Photon with a resize query (696px wide); without the query the original is served
const cleanContent = (html: string): string => {
    const $ = load(html, null, false);
    $('img').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src');
        if (src?.includes('.wp.com/')) {
            $img.attr('src', src.split('?', 1)[0]);
        }
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('loading').removeAttr('decoding').removeAttr('data-recalc-dims').removeAttr('width').removeAttr('height');
    });
    return $.html();
};

export const route: Route = {
    path: '/:category?',
    categories: ['picture'],
    view: ViewType.Articles,
    example: '/kosmofoto/news',
    parameters: { category: 'Category slug, see the table below or the URL of a category page. All posts by default' },
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
            source: ['kosmofoto.com/', 'kosmofoto.com/category/:category', 'kosmofoto.com/category/:parent/:category'],
            target: '/:category',
        },
    ],
    name: 'Posts',
    maintainers: ['IvanWng97'],
    handler,
    description: `The official feed only carries excerpts; this route returns the full post with all images.

| Category           | Slug                   |
| ------------------ | ---------------------- |
| News               | \`news\`                 |
| Film               | \`film-2\`               |
| Featured           | \`featured\`             |
| Analogue lifestyle | \`analogue-lifestyle-2\` |
| Analogue Culture   | \`analogue-culture\`     |
| Analogue History   | \`analogue-history\`     |
| Camera reviews     | \`camera-review-2\`      |
| Classic cameras    | \`classic-cameras\`      |
| Vintage cameras    | \`vintage-cameras\`      |
| Soviet cameras     | \`soviet-cameras\`       |
| Lomography         | \`lomography\`           |
| Kosmo Foto Mono    | \`kosmo-foto-mono\`      |`,
};

async function handler(ctx) {
    const categorySlug = ctx.req.param('category');
    const limit = Number(ctx.req.query('limit')) || 20;

    const category = categorySlug
        ? await cache.tryGet(`kosmofoto:category:${categorySlug}`, async () => {
              const data = await api('categories', { slug: categorySlug });
              if (!Array.isArray(data) || data.length === 0) {
                  throw new InvalidParameterError(`Category "${categorySlug}" not found`);
              }
              return { id: data[0].id, name: decodeHTML(data[0].name), link: data[0].link };
          })
        : undefined;

    // Rendering post bodies is slow on this site, so only list ids here and fetch each post separately, cached per post
    const list = await api('posts', {
        per_page: limit,
        _fields: 'id,link',
        ...(category && { categories: category.id }),
    });
    if (!Array.isArray(list)) {
        throw new TypeError(`Unexpected response from the posts API: ${JSON.stringify(list).slice(0, 200)}`);
    }

    const items = await Promise.all(
        list.map((entry) =>
            cache.tryGet(entry.link, async () => {
                const post = await api(`posts/${entry.id}`, { _embed: 'wp:featuredmedia,wp:term,author' });
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
                } as DataItem;
            })
        )
    );

    return {
        title: category ? `Kosmo Foto - ${category.name}` : 'Kosmo Foto',
        link: category?.link ?? baseUrl,
        description: 'Film photography news, camera reviews and analogue culture.',
        item: items as DataItem[],
    };
}
