import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/:hub?',
    categories: ['new-media', 'popular'],
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
            return b.contents.html;
        case 'CorePullquoteBlockType':
            return `<blockquote>${b.contents.html}</blockquote>`;
        case 'CoreQuoteBlockType':
            return `<blockquote>${b.children.map((child) => renderBlock(child)).join('')}</blockquote>`;
        case 'CoreSeparatorBlockType':
            return '<hr>';
        case 'HighlightBlockType':
            return b.children.map((c) => renderBlock(c)).join('');
        case 'MethodologyAccordionBlockType':
            return `<h2>${b.heading.html}</h2>${b.sections.map((s) => `<h3>${s.heading.html}</h3>${s.content.html}`).join('')}`;
        default:
            throw new Error(`Unsupported block type: ${b.__typename}`);
    }
};

async function handler(ctx) {
    const link = ctx.req.param('hub') ? `https://www.theverge.com/${ctx.req.param('hub')}/rss/index.xml` : 'https://www.theverge.com/rss/index.xml';

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

                description += node.blocks
                    .filter((b) => b.__typename !== 'NewsletterBlockType' && b.__typename !== 'RelatedPostsBlockType' && b.__typename !== 'ProductBlockType' && b.__typename !== 'TableOfContentsBlockType')
                    .map((b) => renderBlock(b))
                    .join('<br><br>');

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
