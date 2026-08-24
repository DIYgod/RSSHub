import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

import { renderHeader } from './templates/header';

const excludeTypes = new Set(['ActionBoxBlockType', 'NewsletterBlockType', 'RelatedPostsBlockType', 'ProductsTableBlockType', 'FeaturedProductsBlockType', 'TableOfContentsBlockType']);

const shouldKeep = (b: any) => !excludeTypes.has(b.__typename);

// Rich text lives under `paragraphContents` (formerly `tempContents`), or as a single `contents` object on headings, list items and quotes
const renderContents = (b: any): string => (b.paragraphContents ?? b.tempContents ?? [b.contents]).map((c) => c?.html ?? '').join('');

// Render a list of blocks; a single unknown or malformed block is dropped with a warning instead of failing the whole article
// Errors are deliberately not caught here: an unrenderable block makes the whole article fall back to the
// server-rendered body, which is still full text, rather than silently emitting a description with a hole in it
const renderBlocks = (blocks: any[] | undefined, separator: string): string =>
    (blocks ?? [])
        .map((b) => renderBlock(b))
        .filter(Boolean)
        .join(separator);

export const route: Route = {
    path: '/:hub?',
    categories: ['new-media'],
    example: '/theverge',
    parameters: { hub: 'Hub, see below, All Posts by default' },
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
            source: ['theverge.com/:hub', 'theverge.com/'],
        },
    ],
    name: 'Category',
    maintainers: ['HenryQW', 'vbali'],
    handler,
    description: `| Hub            | Hub name       |
| -------------- | -------------- |
|                | All Posts      |
| tech           | Tech           |
| reviews        | Reviews        |
| science        | Science        |
| entertainment  | Entertainment  |
| apple          | Apple          |
| google         | Google         |
| microsoft      | Microsoft      |
| amazon         | Amazon         |
| meta           | Meta           |
| samsung        | Samsung        |
| android        | Android        |
| apps           | Apps           |
| games          | Gaming         |
| film           | Film           |
| tv             | TV Shows       |
| music          | Music          |
| streaming      | Streaming      |
| creators       | Creators       |
| culture        | Culture        |
| policy         | Policy         |
| business       | Business       |
| transportation | Transportation |
| space          | Space          |
| health         | Health         |
| web            | Web            |

Any other hub slug from \`theverge.com/rss/<hub>/index.xml\` also works.

Provides a better reading experience (full text articles) over the official one.`,
};

const renderBlock = (b) => {
    if (!shouldKeep(b)) {
        return '';
    }
    switch (b.__typename) {
        case 'CoreEmbedBlockType':
            return b.embedHtml;
        case 'CoreGalleryBlockType':
            return b.images.map((i) => `<figure><img src="${i.image.thumbnails.horizontal.url.split('?', 1)[0]}" alt="${i.alt}" /><figcaption>${i.caption.html}</figcaption></figure>`).join('');
        case 'CoreHeadingBlockType':
            return `<h${b.level}>${renderContents(b)}</h${b.level}>`;
        case 'CoreHTMLBlockType':
            return b.markup;
        case 'CoreImageBlockType':
            return `<figure><img src="${b.thumbnail.url.split('?', 1)[0]}" alt="${b.alt}" /><figcaption>${b.caption.html}</figcaption></figure>`;
        case 'CoreListBlockType':
            return `${b.ordered ? '<ol>' : '<ul>'}${b.items.map((i) => `<li>${renderContents(i)}</li>`).join('')}${b.ordered ? '</ol>' : '</ul>'}`;
        case 'CoreParagraphBlockType':
            return renderContents(b);
        case 'CorePullquoteBlockType':
            return `<blockquote>${renderContents(b)}</blockquote>`;
        case 'CoreQuoteBlockType':
            return `<blockquote>${renderBlocks(b.children, '')}</blockquote>`;
        case 'CoreSeparatorBlockType':
            return '<hr>';
        case 'HighlightBlockType':
            return renderBlocks(b.children, '');
        case 'ImageCompareBlockType':
            return `<figure><img src="${b.leftImage.thumbnails.horizontal.url.split('?', 1)[0]}" alt="${b.leftImage.alt}" /><img src="${b.rightImage.thumbnails.horizontal.url.split('?', 1)[0]}" alt="${b.rightImage.alt}" /><figcaption>${b.caption.html}</figcaption></figure>`;
        case 'ImageSliderBlockType':
            return b.images.map((i) => `<figure><img src="${i.image.originalUrl.split('?', 1)[0]}" alt="${i.alt}" /><figcaption>${i.caption.html}</figcaption></figure>`).join('');
        case 'MethodologyAccordionBlockType':
            return `<h2>${b.heading.html}</h2>${b.sections.map((s) => `<h3>${s.heading.html}</h3>${s.content.html}`).join('')}`;
        case 'ProductBlockType': {
            const product = b.product;
            return `<div><figure><img src="${product.image.thumbnails.horizontal.url.split('?', 1)[0]}" alt="${product.image.alt}" /><figcaption>${product.image.alt}</figcaption></figure><br><a href="${product.bestRetailLink.url}">${product.title} $${product.bestRetailLink.price}</a><br>${product.description.html}${product.pros.html ? `<br>The Good${product.pros.html}The Bad${product.cons.html}` : ''}</div>`;
        }
        case 'VideoBlockType':
            return `<figure><iframe src="https://volume.vox-cdn.com/embed/${b.video.volumeUuid}" allowfullscreen></iframe>${b.caption?.html ? `<figcaption>${b.caption.html}</figcaption>` : ''}</figure>`;
        case 'TableBlockType':
            return `<table><tr>${b.header.map((cell) => `<th>${cell}</th>`).join('')}</tr>${b.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table>`;
        default:
            throw new Error(`Unsupported block type: ${b.__typename}`);
    }
};

const renderNode = (node: any): string => {
    let description = renderHeader({
        featuredImage: node.featuredImage,
        ledeMediaData: node.ledeMediaData,
    });

    description += renderBlocks(node.blocks, '<br><br>');

    if (node.__typename === 'StreamResourceType') {
        description += (node.posts?.edges ?? [])
            .map(({ node: n }) => {
                let d =
                    `<h2><a href="${n.permalink}">${n.promo?.headline || n.title}</a></h2>` +
                    renderHeader({
                        ledeMediaData: n.ledeMediaData,
                    });
                switch (n.__typename) {
                    case 'PostResourceType':
                        d += (n.excerpt ?? []).map((e) => renderContents(e)).join('<br>');
                        break;
                    case 'QuickPostResourceType':
                        d += renderBlocks(n.blocks, '<br>');
                        break;
                    default:
                        break;
                }
                return d;
            })
            .join('<br>');
    }

    return description;
};

async function handler(ctx) {
    const link = ctx.req.param('hub') ? `https://www.theverge.com/rss/${ctx.req.param('hub')}/index.xml` : 'https://www.theverge.com/rss/index.xml';

    // rss-parser's parseURL relies on Node's https.get, which is unavailable on Cloudflare Workers
    const feedText = await ofetch(link, {
        parseResponse: (text) => text,
    });
    const feed = await parser.parseString(feedText);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            try {
                return await cache.tryGet(item.link!, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);

                    try {
                        const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                        const node = nextData.props.pageProps.hydration.responses.find((x) => x.operationName === 'PostLayoutQuery' || x.operationName === 'StreamLayoutQuery')?.data?.node;
                        if (!node) {
                            throw new Error('layout query not found in __NEXT_DATA__');
                        }

                        item.description = renderNode(node);
                        item.category = node.categories?.map((c) => c.title);
                    } catch (error) {
                        // The Verge changes its GraphQL schema from time to time; fall back to the server-rendered article body,
                        // which is still full text. If that is gone too, throw so the summary fallback below stays out of the cache
                        logger.warn(`theverge: failed to render ${item.link} from __NEXT_DATA__, falling back to page HTML: ${error}`);
                        const body = $('.duet--article--article-body-component');
                        if (body.length === 0) {
                            throw new Error(`neither __NEXT_DATA__ nor the article body could be read from ${item.link}`, { cause: error });
                        }
                        item.description = body
                            .toArray()
                            .map((el) => $(el).html())
                            .join('');
                    }

                    return item;
                });
            } catch (error) {
                // A single unreadable article should not take down the whole feed; this result is not cached, so it is retried next time
                logger.warn(`theverge: falling back to the feed summary for ${item.link}: ${error}`);
                // the shared rss-parser does not expose Atom <category> elements, so this path carries no categories
                item.description = item.content;
                return item;
            }
        })
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        item: items as DataItem[],
    };
}
