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

const baseUrl = 'https://www.35mmc.com';

const api = (path: string, query: Record<string, string | number>) =>
    ofetch(`${baseUrl}/wp-json/wp/v2/${path}`, {
        query,
        // the default browser-like Accept header can make WordPress serve the HTML page instead of JSON
        headers: { accept: 'application/json' },
    });

// Post bodies still reference images over plain http (blocked as mixed content by readers) and carry
// srcset/lazy-loading attributes that only make sense in a browser
const cleanContent = (html: string): string => {
    const $ = load(html, null, false);
    $('img').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src');
        if (src?.startsWith('http://')) {
            $img.attr('src', src.replace(/^http:\/\//, 'https://'));
        }
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('loading').removeAttr('decoding');
    });
    return $.html();
};

export const route: Route = {
    path: '/:category?',
    categories: ['picture'],
    view: ViewType.Articles,
    example: '/35mmc/5-frames-with',
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
            source: ['35mmc.com/', '35mmc.com/category/:category', '35mmc.com/category/:parent/:category'],
            target: '/:category',
        },
    ],
    name: 'Posts',
    maintainers: ['IvanWng97'],
    handler,
    description: `The official feed only carries excerpts; this route returns the full post with all images.

| Category                      | Slug                              |
| ----------------------------- | --------------------------------- |
| 5 frames with...              | \`5-frames-with\`                   |
| Gear Reviews & Experiences    | \`reviews-experinces\`              |
| Photos & Projects             | \`photos-projects\`                 |
| Theory & Reflections          | \`theory-reflections\`              |
| Philosophy & Reflections      | \`philosophy-reflections\`          |
| News & Events                 | \`news-events\`                     |
| One Shot Story                | \`one-shot-story\`                  |
| Tutorials & Knowhow           | \`tutorials-knowhow\`               |
| Processes, Tutorials & Guides | \`tutorials\`                       |
| Learning Journeys             | \`learning-journeys\`               |
| Film                          | \`film\`                            |
| Lenses                        | \`lenses\`                          |
| Gear Theory                   | \`gear-theory\`                     |
| Compact Cameras               | \`compact-cameras\`                 |
| Point & Shoot                 | \`point-shoot-film-camera-reviews\` |
| Rangefinder Cameras           | \`rangefinder-cameras\`             |
| SLRs                          | \`slrs\`                            |
| Scale Focus                   | \`scale-focus-cameras\`             |
| Medium & Large Format         | \`medium-format\`                   |
| Digital Cameras               | \`digital-cameras\`                 |
| Accessories & More            | \`accessories-more\`                |
| Mods, DIY & Lens Adapting     | \`lens-adapting-mods\`              |`,
};

async function handler(ctx) {
    const categorySlug = ctx.req.param('category');
    const limit = Number(ctx.req.query('limit')) || 20;

    const category = categorySlug
        ? await cache.tryGet(`35mmc:category:${categorySlug}`, async () => {
              const data = await api('categories', { slug: categorySlug });
              if (!Array.isArray(data) || data.length === 0) {
                  throw new InvalidParameterError(`Category "${categorySlug}" not found`);
              }
              return { id: data[0].id, name: decodeHTML(data[0].name), link: data[0].link };
          })
        : undefined;

    // The posts endpoint renders every post body server-side (~2s per post), so only list ids here
    // and fetch each post separately, in parallel and cached per post
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
                const post = await api(`posts/${entry.id}`, { _embed: 'wp:featuredmedia,wp:term' });
                const featured = post._embedded?.['wp:featuredmedia']?.find((media) => media.id === post.featured_media);
                const image = featured?.source_url;

                return {
                    title: decodeHTML(post.title.rendered),
                    link: post.link,
                    // WordPress returns *_gmt without a timezone designator
                    pubDate: parseDate(`${post.date_gmt}Z`),
                    updated: parseDate(`${post.modified_gmt}Z`),
                    // the users endpoint is disabled on this site, so the author name is only available via the Yoast SEO block
                    author: post.yoast_head_json?.author,
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
        title: category ? `35mmc - ${category.name}` : '35mmc',
        link: category?.link ?? baseUrl,
        description: 'Film photography blog: camera and lens reviews, "5 frames with…", photo projects and essays.',
        item: items as DataItem[],
    };
}
