import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

import { renderHeader } from './templates/header';

const excludeTypes = new Set(['ActionBoxBlockType', 'FeaturedProductsBlockType', 'NewsletterBlockType', 'ProductsTableBlockType', 'RelatedPostsBlockType', 'TableOfContentsBlockType']);

const shouldKeep = (b: any) => !excludeTypes.has(b.__typename);

// Paragraphs and stream excerpts carry `paragraphContents`; headings, list items and pullquotes carry a single `contents`
const renderContents = (b: any): string => (b.paragraphContents ?? [b.contents]).map((c) => c?.html ?? '').join('');

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
| amazon         | Amazon         |
| android        | Android        |
| apple          | Apple          |
| apps           | Apps           |
| blackberry     | BlackBerry     |
| business       | Business       |
| creators       | Creators       |
| culture        | Culture        |
| entertainment  | Entertainment  |
| film           | Film           |
| games          | Gaming         |
| google         | Google         |
| health         | Health         |
| meta           | Meta           |
| microsoft      | Microsoft      |
| music          | Music          |
| policy         | Policy         |
| reviews        | Reviews        |
| samsung        | Samsung        |
| science        | Science        |
| space          | Space          |
| streaming      | Streaming      |
| tech           | Tech           |
| transportation | Transportation |
| tv             | TV Shows       |
| web            | Web            |

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
            // a list nested in a quote comes through the GraphQL payload with no fields beyond __typename
            return b.items?.length ? `${b.ordered ? '<ol>' : '<ul>'}${b.items.map((i) => `<li>${renderContents(i)}</li>`).join('')}${b.ordered ? '</ol>' : '</ul>'}` : '';
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
        case 'TableBlockType':
            return `<table><tr>${b.header.map((cell) => `<th>${cell}</th>`).join('')}</tr>${b.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table>`;
        case 'VideoBlockType':
            return `<figure><iframe src="https://volume.vox-cdn.com/embed/${b.video.volumeUuid}" allowfullscreen></iframe>${b.caption?.html ? `<figcaption>${b.caption.html}</figcaption>` : ''}</figure>`;
        default:
            throw new Error(`Unsupported block type: ${b.__typename}`);
    }
};

async function handler(ctx) {
    const link = ctx.req.param('hub') ? `https://www.theverge.com/rss/${ctx.req.param('hub')}/index.xml` : 'https://www.theverge.com/rss/index.xml';

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);

                const $ = load(response);

                const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                const node = nextData.props.pageProps.hydration.responses.find((x) => x.operationName === 'PostLayoutQuery' || x.operationName === 'StreamLayoutQuery').data.node;

                let description = renderHeader({
                    featuredImage: node.featuredImage,
                    ledeMediaData: node.ledeMediaData,
                });

                description += renderBlocks(node.blocks, '<br><br>');

                if (node.__typename === 'StreamResourceType') {
                    description += node.posts.edges
                        .map(({ node: n }) => {
                            let d =
                                `<h2><a href="${n.permalink}">${n.promo.headline || n.title}</a></h2>` +
                                renderHeader({
                                    ledeMediaData: n.ledeMediaData,
                                });
                            switch (n.__typename) {
                                case 'PostResourceType':
                                    d += n.excerpt.map((e) => renderContents(e)).join('<br>');
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

                item.description = description;
                item.category = node.categories?.map((c) => c.title);

                return item;
            })
        )
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        item: items as DataItem[],
    };
}
