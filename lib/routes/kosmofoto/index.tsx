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

const api = (path: string, query: Record<string, string | number>) => ofetch(`${baseUrl}/wp-json/wp/v2/${path}`, { query });

// Images are served through Jetpack Photon with a resize query (696px wide); without the query the original is served
const cleanContent = (html: string) => {
    const $ = load(html, null, false);
    $('img').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src');
        // Jetpack Photon (i0.wp.com) serves a resized variant; without the query string the original is served
        if (src && new URL(src).hostname.endsWith('.wp.com')) {
            $img.attr('src', src.split('?', 1)[0]);
        }
        // srcset, sizes and the dimensions all describe the resized variant the rewrite just replaced
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('width').removeAttr('height');
    });
    return $;
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
            source: ['kosmofoto.com/category/:category', 'kosmofoto.com/category/:parent/:category', 'kosmofoto.com/'],
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
    const limit = Number(ctx.req.query('limit')) || 10;

    const category = categorySlug
        ? await cache.tryGet(`kosmofoto:category:${categorySlug}`, async () => {
              const data = await api('categories', { slug: categorySlug });
              if (data.length === 0) {
                  throw new InvalidParameterError(`Category "${categorySlug}" not found`);
              }
              return { id: data[0].id, name: data[0].name, link: data[0].link };
          })
        : undefined;

    const posts = await api('posts', {
        per_page: limit,
        _embed: 'wp:featuredmedia,wp:term,author',
        ...(category && { categories: category.id }),
    });

    const items: DataItem[] = posts.map((post) => {
        const featured = post._embedded?.['wp:featuredmedia']?.find((media) => media.id === post.featured_media);
        const $ = cleanContent(post.content.rendered);
        // most posts already show the featured image in the body; only prepend it when the body lacks it
        const image = $(`img.wp-image-${post.featured_media}`).length ? undefined : featured?.source_url;

        return {
            title: post.title.rendered,
            link: post.link,
            // WordPress returns *_gmt without a timezone designator
            pubDate: parseDate(`${post.date_gmt}Z`),
            updated: parseDate(`${post.modified_gmt}Z`),
            author: post._embedded?.author?.[0]?.name,
            // term names are stored HTML-escaped (e.g. `Iron &amp; Wine`) and the middleware only decodes titles
            category: (post._embedded?.['wp:term'] ?? []).flat().map((term) => decodeHTML(term.name)),
            description: renderToString(
                <>
                    {image ? (
                        <figure>
                            <img src={image} alt={featured.alt_text || undefined} />
                            {featured.caption?.rendered ? <figcaption>{raw(featured.caption.rendered)}</figcaption> : null}
                        </figure>
                    ) : null}
                    {raw($.html())}
                </>
            ),
        };
    });

    return {
        title: category ? `Kosmo Foto - ${category.name}` : 'Kosmo Foto',
        link: category?.link ?? baseUrl,
        description: 'Film photography news, camera reviews and analogue culture.',
        item: items,
    };
}
