import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

const feedUrl = 'https://www.nytimes.com/wirecutter/feed/';
const imageBase = 'https://cdn.thewirecutter.com/';

// Presentational or promotional nodes that carry no article content
const dropTypes = new Set(['adslot', 'shortcode-recirc', 'shortcode-scoop_form_callout']);

const allowedTags = new Set([
    'p',
    'a',
    'strong',
    'b',
    'em',
    'i',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'br',
    'hr',
    'img',
    'blockquote',
    'figure',
    'figcaption',
    'div',
    'span',
    'video',
    'source',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
]);
const voidTags = new Set(['br', 'hr', 'img', 'source']);
// Everything else is layout plumbing or tracking metadata
const allowedAttributes = new Set(['href', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan']);

const escapeText = (text: string): string => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const escapeAttribute = (value: string): string => escapeText(value).replaceAll('"', '&quot;');

// Images are served through a resizing CDN; without the query string the original is returned
const originalImage = (url: string): string => (url.startsWith('http') ? url : `${imageBase}${url.replace(/^\//, '')}`).split('?', 1)[0];

const renderImage = (src: string, alt?: string, caption?: string): string =>
    src ? `<figure><img src="${escapeAttribute(originalImage(src))}"${alt ? ` alt="${escapeAttribute(alt)}"` : ''}>${caption ? `<figcaption>${escapeText(caption)}</figcaption>` : ''}</figure>` : '';

// A Wirecutter pick: the product, why it won, and its photo
const renderCallout = (node: any): string =>
    (node.dbData?.callouts ?? [])
        .map((pick) => {
            const heading = [pick.ribbon || node.dbData?.ribbon, pick.name].filter(Boolean).join(': ');
            return `<blockquote>${heading ? `<h4>${escapeText(heading)}</h4>` : ''}${renderImage(pick.images?.full, pick.name)}${pick.title ? `<p><strong>${escapeText(pick.title)}</strong></p>` : ''}${pick.description ? `<p>${escapeText(pick.description)}</p>` : ''}</blockquote>`;
        })
        .join('');

const renderNodes = (nodes: any[] | undefined): string => (nodes ?? []).map((node) => renderNode(node)).join('');

const renderNode = (node: any): string => {
    if (node.type === 'text') {
        return escapeText(node.data ?? '');
    }
    if (node.type === 'comment') {
        return '';
    }
    if (node.type !== 'tag') {
        throw new Error(`Unsupported node type: ${node.type}`);
    }

    const name = node.name;
    if (dropTypes.has(name)) {
        return '';
    }
    switch (name) {
        case 'shortcode-gallery':
            return (node.dbData ?? []).map((image) => renderImage(image.dbData?.source ?? image.imagePaths?.full, image.alt, image.credit)).join('');
        case 'shortcode-callout':
            return renderCallout(node);
        case 'shortcode-caption':
            return `<figure>${renderNodes(node.children)}${node.dbData?.credit ? `<figcaption>${escapeText(node.dbData.credit)}</figcaption>` : ''}</figure>`;
        default:
            break;
    }
    if (!allowedTags.has(name)) {
        throw new Error(`Unsupported tag: ${name}`);
    }

    const attributes = Object.entries(node.attribs ?? {})
        .filter(([key]) => allowedAttributes.has(key))
        .map(([key, value]) => ` ${key}="${escapeAttribute(key === 'src' ? originalImage(String(value)) : String(value))}"`)
        .join('');

    return voidTags.has(name) ? `<${name}${attributes}>` : `<${name}${attributes}>${renderNodes(node.children)}</${name}>`;
};

const renderPost = (post: any): string => {
    const hero = post.heroImage ? renderImage(post.heroImage.source, post.heroImage.alt, post.heroImage.caption) : '';
    const chapters = (post.chapters ?? []).map((chapter) => `${chapter.title ? `<h2>${escapeText(chapter.title)}</h2>` : ''}${renderNodes(chapter.body)}`).join('');
    return hero + chapters;
};

export const route: Route = {
    path: '/wirecutter',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/nytimes/wirecutter',
    parameters: {},
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
            source: ['www.nytimes.com/wirecutter', 'www.nytimes.com/wirecutter/reviews/:slug'],
        },
    ],
    name: 'Wirecutter',
    maintainers: ['IvanWng97'],
    handler,
    description: 'The official feed only carries the opening few paragraphs; this route returns the whole review, including the picks and their photos.',
};

async function handler() {
    const feedText = await ofetch(feedUrl, {
        // rss-parser's parseURL relies on Node's https.get, which is unavailable on Cloudflare Workers
        parseResponse: (text) => text,
    });
    const feed = await parser.parseString(feedText);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            // the feed appends its own tracking parameters
            const link = item.link?.split('?', 1)[0];
            try {
                return await cache.tryGet(link!, async () => {
                    const response = await ofetch(link!);
                    const $ = load(response);
                    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                    const post = nextData.props?.pageProps?.post;
                    if (!post?.chapters) {
                        throw new Error('no post chapters in __NEXT_DATA__');
                    }

                    return {
                        title: post.title ?? item.title,
                        link,
                        description: renderPost(post),
                        author: (post.authors ?? []).map((a) => a.displayName).join(', ') || item.creator,
                        pubDate: item.pubDate,
                        category: [post.primarySection?.name, ...(post.primaryTerms ?? [])].filter(Boolean),
                    } as DataItem;
                });
            } catch (error) {
                // A single unreadable review should not take down the whole feed; this result is not cached, so it is retried next time
                logger.warn(`nytimes/wirecutter: falling back to the feed summary for ${link}: ${error}`);
                return {
                    title: item.title,
                    link,
                    description: item.content,
                    author: item.creator,
                    pubDate: item.pubDate,
                } as DataItem;
            }
        })
    );

    return {
        title: feed.title ?? 'Wirecutter',
        link: 'https://www.nytimes.com/wirecutter',
        description: feed.description,
        item: items,
    };
}
