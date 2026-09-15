import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

// Each section is its own site in a WordPress multisite; the current front end lives on www
const apiBase = 'https://ww2.kqed.org';
const siteBase = 'https://www.kqed.org';

const sections = {
    arts: 'Arts',
    news: 'News',
    science: 'Science',
    forum: 'Forum',
    mindshift: 'MindShift',
    perspectives: 'Perspectives',
    education: 'Education',
};

// The `author` taxonomy only repeats the byline as slugs
const skipTaxonomies = new Set(['author']);

// Post bodies ship with lazy-loading attributes that keep many feed readers from ever loading the embedded
// media, and `sizes="auto"` makes renderers that do not support it pick a zero-width candidate
const cleanContent = (html: string): string => {
    const $ = load(html, null, false);
    $('img, iframe').each((_, el) => {
        $(el).removeAttr('loading').removeAttr('decoding').removeAttr('srcset').removeAttr('sizes');
    });
    return $.html();
};

export const route: Route = {
    path: '/:section?',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/kqed/arts',
    parameters: { section: 'Section, see the table below, `arts` by default' },
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
            // a bare `:section` would also match unrelated top-level pages such as /about or /support
            source: ['www.kqed.org/:section(arts|news|science|forum|mindshift|perspectives|education)', 'www.kqed.org/:section(arts|news|science|forum|mindshift|perspectives|education)/:id/:slug'],
        },
    ],
    name: 'Section',
    maintainers: ['IvanWng97'],
    handler,
    description: `KQED publishes no feed for the current site, and the legacy one marks every image \`loading="lazy"\`, which stops many readers from loading them. This route returns the full post with working images and links to the current site.

| Section      | Slug           |
| ------------ | -------------- |
| Arts         | \`arts\`         |
| News         | \`news\`         |
| Science      | \`science\`      |
| Forum        | \`forum\`        |
| MindShift    | \`mindshift\`    |
| Perspectives | \`perspectives\` |
| Education    | \`education\`    |`,
};

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'arts';
    const sectionName = sections[section as keyof typeof sections];
    if (!sectionName) {
        throw new InvalidParameterError(`Unknown section "${section}", expected one of ${Object.keys(sections).join(', ')}`);
    }
    const limit = Number(ctx.req.query('limit')) || 20;

    const posts = await ofetch(`${apiBase}/${section}/wp-json/wp/v2/posts`, {
        query: {
            per_page: limit,
            orderby: 'date',
            order: 'desc',
            _embed: 'wp:featuredmedia,wp:term,author',
        },
        // the default browser-like Accept header can make WordPress serve the HTML page instead of JSON
        headers: { accept: 'application/json' },
    });
    if (!Array.isArray(posts)) {
        throw new TypeError(`Unexpected response from the posts API: ${JSON.stringify(posts).slice(0, 200)}`);
    }

    const items: DataItem[] = posts.map((post) => {
        const featured = post._embedded?.['wp:featuredmedia']?.find((media) => media.id === post.featured_media);
        const image = featured?.source_url;

        return {
            title: decodeHTML(post.title.rendered),
            // the API still returns legacy ww2 permalinks, so build the current site's URL instead
            link: `${siteBase}/${section}/${post.id}/${post.slug}`,
            // WordPress returns *_gmt without a timezone designator
            pubDate: parseDate(`${post.date_gmt}Z`),
            updated: parseDate(`${post.modified_gmt}Z`),
            author: post._embedded?.author?.[0]?.name,
            category: (post._embedded?.['wp:term'] ?? [])
                .filter((group) => Array.isArray(group))
                .flat()
                .filter((term) => !skipTaxonomies.has(term.taxonomy))
                .map((term) => decodeHTML(term.name)),
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
        title: `KQED - ${sectionName}`,
        link: `${siteBase}/${section}`,
        description: 'Public media for Northern California: Bay Area news, arts and culture, science and education.',
        item: items,
    };
}
