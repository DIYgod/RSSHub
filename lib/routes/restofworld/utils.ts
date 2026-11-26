import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';

const SITE_ORIGIN = 'https://restofworld.org';
export const LATEST_URL = `${SITE_ORIGIN}/latest/`;
export const LATEST_FEED_URL = `${SITE_ORIGIN}/feed/latest/`;
export const DETAIL_CONCURRENCY = 2;

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);
const NOISE_SELECTOR = 'script, style, noscript, .series-footer, .series-callout, .datawrapper__explore, .native-share-btn';

interface JsonLdPerson {
    name?: string;
}

interface JsonLdImageObject {
    url?: string;
    creditText?: string;
    caption?: string;
}

interface JsonLdArticle {
    '@type'?: string | string[];
    headline?: string;
    description?: string;
    datePublished?: string;
    dateModified?: string;
    author?: JsonLdPerson | JsonLdPerson[];
    articleSection?: string | string[];
    keywords?: string | string[];
    image?: JsonLdImageObject | string;
}

interface JsonLdGraph {
    '@graph'?: JsonLdArticle[];
}

export interface RestOfWorldCandidate {
    title?: string;
    link: string;
    rawPubDate?: string;
    author?: string;
    description?: string;
    image?: string;
}

export interface RestOfWorldArticleContent {
    title?: string;
    dek?: string;
    heroImageUrl?: string;
    heroAlt?: string;
    heroCaption?: string;
    bodyHtml: string;
    rawPubDate?: string;
    rawUpdatedAt?: string;
    author?: string;
    categories: string[];
}

const toSafeUrl = (raw: string | undefined): string | undefined => {
    if (!raw) {
        return undefined;
    }
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('data:')) {
        return undefined;
    }
    try {
        const parsed = new URL(trimmed, SITE_ORIGIN);
        return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

const normalizeRestOfWorldUrl = (raw: string | undefined): string | undefined => {
    const safeUrl = toSafeUrl(raw);
    if (!safeUrl) {
        return undefined;
    }
    const parsed = new URL(safeUrl);
    if (parsed.origin !== SITE_ORIGIN || !/^\/\d{4}\//.test(parsed.pathname)) {
        return undefined;
    }
    parsed.search = '';
    parsed.hash = '';
    return parsed.href;
};

export const fetchText = (url: string): Promise<string> =>
    ofetch(url, {
        headers: {
            'user-agent': config.trueUA,
        },
        publicOnly: true,
        retry: 2,
        retryDelay: 800,
    });

export const extractFeedCandidates = (xml: string): RestOfWorldCandidate[] => {
    const $ = load(xml, { xmlMode: true });
    const candidates: RestOfWorldCandidate[] = [];

    $('item').each((_, el) => {
        const item = $(el);
        const link = normalizeRestOfWorldUrl(item.find('guid').first().text() || item.find('link').first().text());
        if (!link) {
            return;
        }
        const mediaContent = item
            .find(String.raw`media\:content, content`)
            .first()
            .attr('url');
        const mediaThumb = item
            .find(String.raw`media\:thumbnail, thumbnail`)
            .first()
            .attr('url');
        candidates.push({
            title: item.find('title').first().text() || undefined,
            link,
            rawPubDate: item.find('pubDate').first().text().trim() || undefined,
            author:
                item
                    .find(String.raw`dc\:creator, creator`)
                    .first()
                    .text()
                    .trim() || undefined,
            description: item.find('description').first().text().trim() || undefined,
            image: toSafeUrl(mediaContent || mediaThumb),
        });
    });

    return candidates;
};

const isNewsArticleNode = (node: JsonLdArticle): boolean => {
    const nodeType = node['@type'];
    if (Array.isArray(nodeType)) {
        return nodeType.includes('NewsArticle') || nodeType.includes('Article');
    }
    return nodeType === 'NewsArticle' || nodeType === 'Article';
};

const extractJsonLdArticle = ($: CheerioAPI): JsonLdArticle | undefined => {
    const scripts = $('script[type="application/ld+json"]').toArray();
    for (const scriptEl of scripts) {
        const rawText = $(scriptEl).text();
        if (!rawText) {
            continue;
        }
        try {
            const parsed = JSON.parse(rawText) as JsonLdGraph & JsonLdArticle;
            if (isNewsArticleNode(parsed)) {
                return parsed;
            }
            const graphMatch = (parsed['@graph'] ?? []).find((entry) => isNewsArticleNode(entry));
            if (graphMatch) {
                return graphMatch;
            }
        } catch {
            // Skip malformed JSON-LD script blocks
        }
    }
    return undefined;
};

const formatJsonLdAuthors = (rawAuthor: JsonLdPerson | JsonLdPerson[] | undefined): string | undefined => {
    if (!rawAuthor) {
        return undefined;
    }
    const list = Array.isArray(rawAuthor) ? rawAuthor : [rawAuthor];
    const names = list.map((person) => person.name?.trim()).filter((name): name is string => Boolean(name));
    return names.length ? names.join(', ') : undefined;
};

const pushCategoryValues = (target: Set<string>, value: string | string[] | undefined): void => {
    if (!value) {
        return;
    }
    const list = Array.isArray(value) ? value : [value];
    for (const entry of list) {
        for (const piece of entry.split(',')) {
            const trimmed = piece.trim();
            if (trimmed) {
                target.add(trimmed);
            }
        }
    }
};

const extractCategories = ($: CheerioAPI, jsonLd?: JsonLdArticle): string[] => {
    const categories = new Set<string>();
    const sectionText = $('.post-header__text__section').first().text().trim();
    if (sectionText) {
        categories.add(sectionText);
    }
    pushCategoryValues(categories, jsonLd?.articleSection);
    pushCategoryValues(categories, jsonLd?.keywords);
    return [...categories];
};

const resolveLazyImages = ($: CheerioAPI, container: Cheerio<Element>): void => {
    container.find('img').each((_, imgEl) => {
        const img = $(imgEl);
        const safeSrc = toSafeUrl(img.attr('src')) ?? toSafeUrl(img.attr('data-src'));
        if (safeSrc) {
            img.attr('src', safeSrc);
        } else {
            img.remove();
            return;
        }
        img.removeAttr('data-src').removeAttr('srcset').removeAttr('sizes').removeAttr('style').removeAttr('class').removeAttr('loading');
    });
};

const resolveLazyIframes = ($: CheerioAPI, container: Cheerio<Element>): void => {
    container.find('iframe').each((_, frameEl) => {
        const frame = $(frameEl);
        const safeSrc = toSafeUrl(frame.attr('src') || frame.attr('data-src'));
        if (!safeSrc) {
            frame.remove();
            return;
        }
        frame.attr('src', safeSrc).removeAttr('data-src');
    });
};

const resolveDatawrapperEmbeds = ($: CheerioAPI, container: Cheerio<Element>): void => {
    container.find('.embed--datawrapper').each((_, wrapEl) => {
        const wrap = $(wrapEl);
        const iframe = wrap.find('iframe').first();
        const chartUrl = toSafeUrl(iframe.attr('src') || iframe.attr('data-src'));
        if (!chartUrl) {
            wrap.remove();
            return;
        }
        const title = iframe.attr('title')?.trim() || 'Interactive chart';
        wrap.append($('<figcaption>').append($('<a>').attr('href', chartUrl).text(title)));
    });
};

const extractHeroMedia = ($: CheerioAPI, jsonLd?: JsonLdArticle) => {
    const heroImg = $('.post-header__image img').first();
    const jldImage = typeof jsonLd?.image === 'string' ? { url: jsonLd.image } : jsonLd?.image;
    const url = toSafeUrl(heroImg.attr('src') || heroImg.attr('data-src') || jldImage?.url);
    const alt = heroImg.attr('alt')?.trim() || undefined;
    const rawCaption = $('.post-header__image figcaption').first().text().replaceAll(/\s+/g, ' ').trim();
    const caption = rawCaption || jldImage?.caption?.trim() || jldImage?.creditText?.trim() || undefined;
    return { url, alt, caption };
};

const extractArticleAuthor = ($: CheerioAPI, jsonLd?: JsonLdArticle, fallbackAuthor?: string): string | undefined => {
    const jsonAuthor = formatJsonLdAuthors(jsonLd?.author);
    if (jsonAuthor) {
        return jsonAuthor;
    }
    const domAuthors = $('.post-subheader__byline .author')
        .toArray()
        .map((el) => $(el).text().trim())
        .filter(Boolean);
    return domAuthors.length ? domAuthors.join(', ') : fallbackAuthor;
};

const resolveExplainerTags = ($: CheerioAPI, container: Cheerio<Element>): void => {
    container.find('.explainer-tag').each((_, el) => {
        const tag = $(el);
        tag.find('.description, .info-icon').remove();
        const termLink = tag.find('mark.term a').first();
        const href = toSafeUrl(termLink.attr('href'));
        const label = termLink.text().trim() || tag.find('mark.term').first().text().trim();
        if (href && label) {
            tag.replaceWith($('<a>').attr('href', href).text(label));
        } else {
            tag.replaceWith(label);
        }
    });
    container.find('svg').each((_, svgEl) => {
        const svg = $(svgEl);
        if (svg.find('use').length) {
            svg.remove();
        }
    });
};

export const parseArticleDetail = (html: string, fallback: RestOfWorldCandidate): RestOfWorldArticleContent => {
    const $ = load(html);
    const jsonLd = extractJsonLdArticle($);
    const content = $('.post-content').first();
    $(NOISE_SELECTOR, content).remove();
    resolveExplainerTags($, content);
    resolveDatawrapperEmbeds($, content);
    resolveLazyIframes($, content);
    resolveLazyImages($, content);

    const hero = extractHeroMedia($, jsonLd);
    const domTitle = $('.post-header__text__title').first().text();
    const dek = $('.post-header__text__dek').first().text().trim() || jsonLd?.description?.trim() || fallback.description;

    return {
        title: fallback.title || jsonLd?.headline || domTitle || undefined,
        dek,
        heroImageUrl: hero.url ?? fallback.image,
        heroAlt: hero.alt,
        heroCaption: hero.caption,
        bodyHtml: content.html() ?? '',
        rawPubDate: jsonLd?.datePublished?.trim() || fallback.rawPubDate,
        rawUpdatedAt: jsonLd?.dateModified?.trim() || undefined,
        author: extractArticleAuthor($, jsonLd, fallback.author),
        categories: extractCategories($, jsonLd),
    };
};
