import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import parser from '@/utils/rss-parser';

const excludeTypes = new Set(['NewsletterBlockType', 'RelatedPostsBlockType', 'ProductsTableBlockType', 'TableOfContentsBlockType']);

const shouldKeep = (b: any) => !excludeTypes.has(b.__typename.trim());

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
    description: `| Hub         | Hub name            |
| ----------- | ------------------- |
|             | All Posts           |
| android     | Android             |
| apple       | Apple               |
| apps        | Apps & Software     |
| blackberry  | BlackBerry          |
| culture     | Culture             |
| gaming      | Gaming              |
| hd          | HD & Home           |
| microsoft   | Microsoft           |
| photography | Photography & Video |
| policy      | Policy & Law        |
| web         | Web & Social        |

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
            return b.images.map((i) => `<figure><img src="${i.image.thumbnails.horizontal.url.split('?')[0]}" alt="${i.alt}" /><figcaption>${i.caption.html}</figcaption></figure>`).join('');
        case 'CoreHeadingBlockType':
            return `<h${b.level}>${b.contents.html}</h${b.level}>`;
        case 'CoreHTMLBlockType':
            return b.markup;
        case 'CoreImageBlockType':
            return `<figure><img src="${b.thumbnail.url.split('?')[0]}" alt="${b.alt}" /><figcaption>${b.caption.html}</figcaption></figure>`;
        case 'CoreListBlockType':
            return `${b.ordered ? '<ol>' : '<ul>'}${b.items.map((i) => `<li>${i.contents.html}</li>`).join('')}${b.ordered ? '</ol>' : '</ul>'}`;
        case 'CoreParagraphBlockType':
            return b.tempContents.map((c) => c.html).join('');
        case 'CorePullquoteBlockType':
            return `<blockquote>${b.contents.html}</blockquote>`;
        case 'CoreQuoteBlockType':
            return `<blockquote>${b.children.map((child) => renderBlock(child)).join('')}</blockquote>`;
        case 'CoreSeparatorBlockType':
            return '<hr>';
        case 'HighlightBlockType':
            return b.children.map((c) => renderBlock(c)).join('');
        case 'ImageCompareBlockType':
            return `<figure><img src="${b.leftImage.thumbnails.horizontal.url.split('?')[0]}" alt="${b.leftImage.alt}" /><img src="${b.rightImage.thumbnails.horizontal.url.split('?')[0]}" alt="${b.rightImage.alt}" /><figcaption>${b.caption.html}</figcaption></figure>`;
        case 'ImageSliderBlockType':
            return b.images.map((i) => `<figure><img src="${i.image.originalUrl.split('?')[0]}" alt="${i.alt}" /><figcaption>${i.caption.html}</figcaption></figure>`).join('');
        case 'MethodologyAccordionBlockType':
            return `<h2>${b.heading.html}</h2>${b.sections.map((s) => `<h3>${s.heading.html}</h3>${s.content.html}`).join('')}`;
        case 'ProductBlockType': {
            const product = b.product;
            return `<div><figure><img src="${product.image.thumbnails.horizontal.url.split('?')[0]}" alt="${product.image.alt}" /><figcaption>${product.image.alt}</figcaption></figure><br><a href="${product.bestRetailLink.url}">${product.title} $${product.bestRetailLink.price}</a><br>${product.description.html}${product.pros.html ? `<br>The Good${product.pros.html}The Bad${product.cons.html}` : ''}</div>`;
        }
        case 'TableBlockType':
            return `<table><tr>${b.header.map((cell) => `<th>${cell}</th>`).join('')}</tr>${b.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</table>`;
        default:
            throw new Error(`Unsupported block type: ${b.__typename}`);
    }
};

async function handler(ctx) {
    const link = ctx.req.param('hub') ? `https://www.theverge.com/rss/${ctx.req.param('hub')}/index.xml` : 'https://www.theverge.com/rss/index.xml';

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);

                const $ = load(response);

                const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                const node = nextData.props.pageProps.hydration.responses.find((x) => x.operationName === 'PostLayoutQuery' || x.operationName === 'StreamLayoutQuery').data.node;

                let description = art(path.join(__dirname, 'templates/header.art'), {
                    featuredImage: node.featuredImage,
                    ledeMediaData: node.ledeMediaData,
                });

                description += node.blocks.map((b) => renderBlock(b)).join('<br><br>');

                if (node.__typename === 'StreamResourceType') {
                    description += node.posts.edges
                        .map(({ node: n }) => {
                            let d =
                                `<h2><a href="${n.permalink}">${n.promo.headline || n.title}</a></h2>` +
                                art(path.join(__dirname, 'templates/header.art'), {
                                    ledeMediaData: n.ledeMediaData,
                                });
                            switch (n.__typename) {
                                case 'PostResourceType':
                                    d += n.excerpt.map((e) => e.contents.html).join('<br>');
                                    break;
                                case 'QuickPostResourceType':
                                    d += n.blocks.map((b) => renderBlock(b)).join('<br>');
                                    break;
                                default:
                                    break;
                            }
                            return d;
                        })
                        .join('<br>');
                }

                item.description = description;
                item.category = node.categories;

                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
}
