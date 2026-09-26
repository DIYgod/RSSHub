import { load } from 'cheerio';

import { config } from '@/config';
import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.dr.dk';
const feedUrl = (slug: string) => `${rootUrl}/nyheder/service/feeds/${slug}`;

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const renderInline = (nodes: any[] = []): string =>
    nodes
        .map((node) => {
            switch (node.type) {
                case 'Text':
                    return escapeHtml(node.text ?? '');
                case 'Italic':
                    return `<em>${renderInline(node.body)}</em>`;
                case 'Bold':
                    return `<strong>${renderInline(node.body)}</strong>`;
                case 'Link':
                    return `<a href="${escapeHtml(node.url ?? '')}">${renderInline(node.body)}</a>`;
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
    let caption = image.description ? escapeHtml(image.description) : '';
    if (credit) {
        const attribution = [image.photographer, image.copyright].filter(Boolean).join(' / ');
        if (attribution) {
            caption += `${caption ? ' ' : ''}<small>${escapeHtml(attribution)}</small>`;
        }
    }
    const figcaption = caption ? `<figcaption>${caption}</figcaption>` : '';
    return `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(alt)}">${figcaption}</figure>`;
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
                    return `<h2>${escapeHtml(component.text ?? '')}</h2>`;
                case 'QuoteComponent': {
                    const quote = component.body ? `<p>${escapeHtml(component.body)}</p>` : '';
                    const citation = component.citation ? `<footer>${escapeHtml(component.citation)}</footer>` : '';
                    return `<blockquote>${quote}${citation}</blockquote>`;
                }
                case 'ImageComponent':
                    return renderImage(component.image?.default);
                case 'MediaComponent': {
                    const poster = component.resource?.imageUri ?? component.resource?.image?.managedUrl;
                    if (!poster) {
                        return '';
                    }
                    const caption = component.caption ? `<figcaption>${escapeHtml(component.caption)}</figcaption>` : '';
                    return `<figure><img src="${escapeHtml(poster)}" alt="${escapeHtml(component.caption ?? '')}">${caption}</figure>`;
                }
                case 'ImageCollectionComponent':
                    return (component.images ?? [])
                        .map((entry: any) => renderImage(entry?.default, { credit: true }))
                        .filter(Boolean)
                        .join('');
                case 'FactBoxComponent': {
                    const expression = component.expression ?? {};
                    const image = renderImage(expression.image?.default, { credit: true });
                    const title = expression.title ? `<h3>${escapeHtml(expression.title)}</h3>` : '';
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

export const extractDRArticle = (html: string) => {
    const $ = load(html);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text() || '{}');
    const viewProps = nextData.props?.pageProps?.viewProps;
    const resource = viewProps?.resource ?? viewProps?.article;
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
        image: image ?? undefined,
        // `resource.published` is a boolean, so only `startDate` can be parsed as a date.
        pubDate: resource.startDate ? parseDate(resource.startDate) : undefined,
    };
};

const fetchDRArticle = async (link: string) => {
    try {
        return await cache.tryGet(`dr:article:${link}`, async () => {
            const html = await ofetch(link, {
                headers: {
                    'User-Agent': config.trueUA,
                },
            });
            const article = extractDRArticle(html);
            if (!article) {
                throw new Error(`Unable to extract the full article from ${link}`);
            }
            return article;
        });
    } catch (error) {
        // Throwing inside the cache callback keeps the RSS summary fallback out of the cache,
        // so a temporary DR outage does not poison the cached article.
        logger.error(`Failed to fetch DR article ${link}: ${error}`);
        return null;
    }
};

export const getNews = async (slug: string): Promise<Data> => {
    const feed = await parser.parseURL(feedUrl(slug));

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const base = {
                title: item.title,
                link: item.link,
                guid: item.guid ?? item.link,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            };

            const article = await fetchDRArticle(item.link!);

            if (article?.content) {
                return {
                    ...base,
                    pubDate: article.pubDate ?? base.pubDate,
                    description: article.content,
                    author: article.author,
                    category: article.category ?? item.category,
                    image: article.image,
                } as DataItem;
            }

            // Fall back to the official RSS description when the full article cannot be extracted.
            return {
                ...base,
                description: item.contentSnippet ?? item.content,
            } as DataItem;
        })
    );

    return {
        title: feed.title ?? '',
        link: feed.link ?? rootUrl,
        description: feed.description,
        item: items,
        language: feed.language,
    };
};
