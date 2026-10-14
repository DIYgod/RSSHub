import { load } from 'cheerio';
import { escape, escapeAttribute } from 'entities/escape';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const renderHTML = (node) => {
    if (!node) {
        return '';
    }
    if (Array.isArray(node)) {
        return node.map((n) => renderHTML(n)).join('');
    }

    switch (node.type) {
        case 'a':
            return `<a ${Object.entries(node.attribs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ')}>${renderHTML(node.children)}</a>`;
        case 'div':
            return `<div ${
                node.attribs
                    ? Object.entries(node.attribs)
                          .map(([key, value]) => `${key}="${value}"`)
                          .join(' ')
                    : ''
            }>${renderHTML(node.children)}</div>`;
        case 'blockquote':
        case 'svg':
        case 'g':
        case 'path':
            return `<${node.type} ${Object.entries(node.attribs ?? {})
                .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`)
                .join(' ')}>${renderHTML(node.children)}</${node.type}>`;
        case 'blockquote-quote':
            return `<blockquote>${renderHTML(node.children)}</blockquote>`;
        case 'iframe':
            return `<iframe ${Object.entries(node.attribs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ')}></iframe>`;
        case 'leading':
        case 'img': {
            const attributes = node.attribs ?? { src: node.url ?? node.generic_og?.url ?? node.style?.url };
            const caption = node.attribs?.title ?? node.title;
            return `<figure><img ${Object.entries(attributes)
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`)
                .join(' ')}>${caption ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`;
        }
        case 'em':
        case 'h3':
        case 'li':
        case 'ol':
        case 'ul':
        case 'p':
        case 'strong':
        case 'u':
            return `<${node.type}>${renderHTML(node.children)}</${node.type}>`;
        case 'text':
            return node.data;
        case 'script':
        case 'inline-ad-slot':
        case 'inline-widget':
        case 'inline-plus-widget':
        case 'track-viewed-percentage':
            return '';
        default:
            return `Unhandled type: ${node.type} ${JSON.stringify(node)}`;
    }
};

const renderArticleField = (field) =>
    field?.json
        ? renderHTML(field.json)
        : field?.text
          ? field.text
                .split('\n')
                .map((paragraph) => `<p>${escape(paragraph)}</p>`)
                .join('')
          : '';

export const parseItem = async (item) => {
    const { _data: response, url } = await ofetch.raw(item.link);

    if (new URL(url).hostname !== 'www.scmp.com') {
        // e.g., https://multimedia.scmp.com/
        return item;
    }

    const $ = load(response);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const data = nextData.props.pageProps.payload.data;
    const article = data.article ?? data.node;
    if (!article) {
        return item;
    }

    // item.nextData = article;

    item.summary = renderArticleField(article.summary);
    item.description = renderArticleField(article.subHeadline) + renderHTML(article.images.find((i) => i.type === 'leading')) + renderArticleField(article.body);
    item.updated = parseDate(article.updatedDate, 'x');
    item.category = [...new Set([...article.topics.map((t) => t.name), ...(article.sectionsV2?.flatMap((t) => t.value.map((v) => v.name)) ?? []), ...article.keywords.flatMap((keyword) => (keyword ? keyword.split(', ') : []))])];
    item.author =
        article.authors
            .map((author) => author.name)
            .filter(Boolean)
            .join(', ') || undefined;

    // N.B. gallery in article is not rendered
    // e.g., { type: 'div', attribs: { class: 'scmp-photo-gallery', 'data-gallery-nid': '3239409' }}
    // from https://www.scmp.com/news/china/politics/article/3239355/li-keqiang-former-premier-china-dead

    return item;
};

export const parseCachedItem = async (item) => {
    const details = await cache.tryGet(`scmp:details:v4:${item.link}`, async () => {
        const parsed = await parseItem({ link: item.link });
        return {
            ...(parsed.description !== undefined && { description: parsed.description }),
            ...(parsed.summary !== undefined && { summary: parsed.summary }),
            ...(parsed.category !== undefined && { category: parsed.category }),
            ...(parsed.updated !== undefined && { updated: parsed.updated }),
            ...(parsed.author !== undefined && { author: parsed.author }),
        };
    });
    return { ...item, ...details, author: item.author ?? details.author, updated: item.updated ?? details.updated };
};
