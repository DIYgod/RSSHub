import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { escapeUTF8 } from 'entities';
import pMap from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.dr.dk';
const feedUrl = (slug: string) => `${rootUrl}/nyheder/service/feeds/${slug}`;

const renderInline = (nodes: any[] = []): string =>
    nodes
        .map((node) => {
            switch (node.type) {
                case 'Text':
                    return escapeUTF8(node.text ?? '');
                case 'Italic':
                    return `<em>${renderInline(node.body)}</em>`;
                case 'Bold':
                    return `<strong>${renderInline(node.body)}</strong>`;
                case 'Link':
                    return `<a href="${escapeUTF8(node.url ?? '')}">${renderInline(node.body)}</a>`;
                default:
                    return '';
            }
        })
        .join('');

const renderImage = (image: any, { credit = false }: { credit?: boolean } = {}): string => {
    if (!image?.url) {
        return '';
    }
    const alt = image.altText ?? image.description ?? '';
    let caption = image.description ? escapeUTF8(image.description) : '';
    if (credit) {
        const attribution = [image.photographer, image.copyright].filter(Boolean).join(' / ');
        if (attribution) {
            caption += `${caption ? ' ' : ''}<small>${escapeUTF8(attribution)}</small>`;
        }
    }
    const figcaption = caption ? `<figcaption>${caption}</figcaption>` : '';
    return `<figure><img src="${escapeUTF8(image.url)}" alt="${escapeUTF8(alt)}">${figcaption}</figure>`;
};

// FactBox bodies use lowercase block node types (Paragraph, UnorderedList, ...) instead of the
// *Component types used in the article body.
const renderFactBoxBody = (nodes: any[] = []): string =>
    nodes
        .map((node) => {
            switch (node.type) {
                case 'Paragraph':
                    return `<p>${renderInline(node.body)}</p>`;
                case 'UnorderedList':
                    return `<ul>${(node.items ?? []).map((item) => `<li>${renderFactBoxBody(item.body)}</li>`).join('')}</ul>`;
                case 'OrderedList':
                    return `<ol>${(node.items ?? []).map((item) => `<li>${renderFactBoxBody(item.body)}</li>`).join('')}</ol>`;
                default:
                    return '';
            }
        })
        .join('');

const renderBody = (components: any[] = []): string =>
    components
        .map((component) => {
            switch (component.type) {
                case 'ParagraphComponent':
                    return `<p>${renderInline(component.body)}</p>`;
                case 'HeadingComponent':
                    return `<h2>${escapeUTF8(component.text ?? '')}</h2>`;
                case 'QuoteComponent': {
                    const quote = component.body ? `<p>${escapeUTF8(component.body)}</p>` : '';
                    const citation = component.citation ? `<footer>${escapeUTF8(component.citation)}</footer>` : '';
                    return `<blockquote>${quote}${citation}</blockquote>`;
                }
                case 'ImageComponent':
                    return renderImage(component.image?.default);
                case 'MediaComponent': {
                    const poster = component.resource?.imageUri ?? component.resource?.image?.managedUrl;
                    if (!poster) {
                        return '';
                    }
                    const caption = component.caption ? `<figcaption>${escapeUTF8(component.caption)}</figcaption>` : '';
                    return `<figure><img src="${escapeUTF8(poster)}" alt="${escapeUTF8(component.caption ?? '')}">${caption}</figure>`;
                }
                case 'ImageCollectionComponent':
                    return (component.images ?? [])
                        .map((entry: any) => renderImage(entry?.default, { credit: true }))
                        .filter(Boolean)
                        .join('');
                case 'FactBoxComponent': {
                    const expression = component.expression ?? {};
                    const image = renderImage(expression.image?.default, { credit: true });
                    const title = expression.title ? `<h3>${escapeUTF8(expression.title)}</h3>` : '';
                    const body = renderFactBoxBody(expression.body);
                    return image || title || body ? `<aside>${image}${title}${body}</aside>` : '';
                }
                case 'EmphasizedListComponent':
                    return `<ul>${(component.items ?? []).map((item) => `<li>${renderBody(item.body)}</li>`).join('')}</ul>`;
                // ReadMoreLinkComponent (related articles), CodeComponent (interactive graphics)
                // and OEmbedComponent (embedded player) are excluded from the article body.
                default:
                    return '';
            }
        })
        .filter(Boolean)
        .join('\n');

const findArticleResource = (value: any, pathname: string): Record<string, any> | undefined => {
    if (!value || typeof value !== 'object') {
        return;
    }
    if (value.urlPathId === pathname && Array.isArray(value.body)) {
        return value;
    }
    for (const child of Object.values(value)) {
        const resource = findArticleResource(child, pathname);
        if (resource) {
            return resource;
        }
    }
};

const extractFlightArticle = ($: CheerioAPI, link: string) => {
    const pathname = new URL(link, rootUrl).pathname;
    for (const script of $('script').toArray()) {
        const payload = $(script)
            .text()
            .match(/self\.__next_f\.push\((\[.*\])\)/s)?.[1];
        if (!payload) {
            continue;
        }
        const chunk = JSON.parse(payload);
        if (chunk[0] !== 1 || typeof chunk[1] !== 'string') {
            continue;
        }
        const records = chunk[1].split('\n');
        for (const record of records) {
            const json = record.slice(record.indexOf(':') + 1);
            if (!json.startsWith('{') && !json.startsWith('[')) {
                continue;
            }
            try {
                const resource = findArticleResource(JSON.parse(json), pathname);
                if (resource) {
                    return resource;
                }
            } catch {
                // Ignore non-JSON React Flight records and retain the official RSS fallback.
            }
        }
    }
};

export const extractDRArticle = (html: string, link?: string) => {
    const $ = load(html);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text() || '{}');
    const viewProps = nextData.props?.pageProps?.viewProps;
    const resource = viewProps?.resource ?? viewProps?.article ?? extractFlightArticle($, link ?? $('link[rel="canonical"]').attr('href') ?? rootUrl);
    if (!resource) {
        return null;
    }
    const content = renderBody(resource.body);
    if (!content) {
        return null;
    }
    const author = (resource.contributions ?? [])
        .map((contribution) => contribution?.agent?.name)
        .filter(Boolean)
        .join(', ');
    const image = resource.teaserImage?.default?.url ?? resource.teaserImage?.default?.managedUrl;
    return {
        title: resource.title,
        content,
        author: author || undefined,
        category: resource.site?.title,
        image,
        // `resource.published` is a boolean, so only `startDate` can be parsed as a date.
        pubDate: resource.startDate ? parseDate(resource.startDate) : undefined,
    };
};

type FeedItem = Awaited<ReturnType<typeof parser.parseURL>>['items'][number];

const fetchDRArticle = async (item: FeedItem) => {
    const base = {
        title: item.title,
        link: item.link,
        guid: item.guid ?? item.link,
        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
    };

    try {
        return await cache.tryGet(`dr:article:${item.link}`, async () => {
            const html = await ofetch(item.link!);
            const article = extractDRArticle(html, item.link);
            if (!article) {
                throw new Error(`Unable to extract the full article from ${item.link}`);
            }

            return {
                ...base,
                pubDate: article.pubDate ?? base.pubDate,
                description: article.content,
                author: article.author,
                category: article.category ?? item.category,
                image: article.image,
            } as DataItem;
        });
    } catch {
        // Fall back to the official RSS description when the full article cannot be extracted.
        return {
            ...base,
            description: item.contentSnippet ?? item.content,
        } as DataItem;
    }
};

export const getNews = async (slug: string): Promise<Data> => {
    const feed = await parser.parseURL(feedUrl(slug));

    const list = feed.items;
    const items = await pMap(list, (item) => fetchDRArticle(item), { concurrency: 4 });

    return {
        title: feed.title ?? '',
        link: feed.link ?? rootUrl,
        description: feed.description,
        item: items,
        language: feed.language,
    };
};
