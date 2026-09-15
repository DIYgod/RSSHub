import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://fraenkelgallery.com';

const types = {
    exhibitions: { endpoint: 'fraenkel_exhibition', title: 'Exhibitions', link: `${baseUrl}/exhibitions` },
    posts: { endpoint: 'posts', title: 'Conversations', link: `${baseUrl}/conversations` },
};

// Drop the sales-enquiry buttons and use the original image behind the Jetpack Photon resize query
const cleanContent = (html: string): string => {
    const $ = load(html, null, false);
    $('.block--button').remove();
    $('img, iframe').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src');
        // Jetpack Photon (i0.wp.com) serves a resized variant; without the query string the original is served
        if (src && URL.canParse(src) && new URL(src).hostname.endsWith('.wp.com')) {
            $img.attr('src', src.split('?', 1)[0]);
        }
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('loading').removeAttr('decoding').removeAttr('width').removeAttr('height');
    });
    return $.html();
};

export const route: Route = {
    path: '/:type?',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/fraenkelgallery/exhibitions',
    parameters: { type: '`exhibitions` (default) or `posts` (the Conversations blog)' },
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
            source: ['fraenkelgallery.com/exhibitions', 'fraenkelgallery.com/'],
            target: '/exhibitions',
        },
        {
            source: ['fraenkelgallery.com/conversations'],
            target: '/posts',
        },
    ],
    name: 'Exhibitions & Conversations',
    maintainers: ['IvanWng97'],
    handler,
    description: 'Exhibitions come with artist, year, type and status as categories and the full exhibition page including all images.',
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'exhibitions';
    const config = types[type as keyof typeof types];
    if (!config) {
        throw new InvalidParameterError(`Unknown type "${type}", expected one of ${Object.keys(types).join(', ')}`);
    }
    const { endpoint, title, link } = config;
    const limit = Number(ctx.req.query('limit')) || 20;

    const entries = await ofetch(`${baseUrl}/wp-json/wp/v2/${endpoint}`, {
        query: { per_page: limit, _embed: 'wp:featuredmedia,wp:term' },
        // the default browser-like Accept header can make WordPress serve the HTML page instead of JSON
        headers: { accept: 'application/json' },
    });
    if (!Array.isArray(entries)) {
        throw new TypeError(`Unexpected response from the ${endpoint} API: ${JSON.stringify(entries).slice(0, 200)}`);
    }

    const items: DataItem[] = entries.map((entry) => {
        const featured = entry._embedded?.['wp:featuredmedia']?.find((media) => media.id === entry.featured_media);
        const image = featured?.source_url;

        return {
            title: decodeHTML(entry.title.rendered),
            link: entry.link,
            // WordPress returns *_gmt without a timezone designator
            pubDate: parseDate(`${entry.date_gmt}Z`),
            updated: parseDate(`${entry.modified_gmt}Z`),
            category: (entry._embedded?.['wp:term'] ?? []).flat().map((term) => decodeHTML(term.name)),
            description: renderToString(
                <>
                    {image ? (
                        <figure>
                            <img src={image} alt={featured.alt_text || undefined} />
                            {featured.caption?.rendered ? <figcaption>{raw(featured.caption.rendered)}</figcaption> : null}
                        </figure>
                    ) : null}
                    {raw(cleanContent(entry.content.rendered))}
                </>
            ),
        };
    });

    return {
        title: `Fraenkel Gallery - ${title}`,
        link,
        description: 'Photography gallery in San Francisco: exhibitions and conversations.',
        item: items,
    };
}
