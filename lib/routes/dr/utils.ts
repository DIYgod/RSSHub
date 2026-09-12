import { load } from 'cheerio';

import { config } from '@/config';
import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
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
                case 'ImageComponent': {
                    const image = component.image?.default;
                    if (!image?.url) {
                        return '';
                    }
                    const alt = image.altText ?? image.description ?? '';
                    const caption = image.description ? `<figcaption>${escapeHtml(image.description)}</figcaption>` : '';
                    return `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(alt)}">${caption}</figure>`;
                }
                case 'MediaComponent': {
                    const poster = component.resource?.imageUri ?? component.resource?.image?.managedUrl;
                    if (!poster) {
                        return '';
                    }
                    const caption = component.caption ? `<figcaption>${escapeHtml(component.caption)}</figcaption>` : '';
                    return `<figure><img src="${escapeHtml(poster)}" alt="${escapeHtml(component.caption ?? '')}">${caption}</figure>`;
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
        pubDate: (resource.startDate ?? resource.published) ? parseDate(resource.startDate ?? resource.published) : undefined,
    };
};

const fetchDRArticle = (link: string) =>
    cache.tryGet(`dr:article:${link}`, async () => {
        try {
            const { data: html } = await got(link, {
                headers: {
                    'User-Agent': config.trueUA,
                },
            });
            return extractDRArticle(html);
        } catch (error) {
            logger.error(`Failed to fetch DR article ${link}: ${error}`);
            return null;
        }
    });

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
