import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';

const SITE_ORIGIN = 'https://supabase.com';
export const BLOG_URL = `${SITE_ORIGIN}/blog`;
export const RSS_URL = `${SITE_ORIGIN}/rss.xml`;
export const DETAIL_CONCURRENCY = 3;

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);
const NOISE_SELECTOR = 'script, style, noscript, h1, a[aria-label="Copy link to section"], span.sr-only, button.ch-editor-button, svg[aria-hidden="true"]';

interface JsonLdPerson {
    name?: string;
}

interface JsonLdBlogPosting {
    '@type'?: string | string[];
    headline?: string;
    datePublished?: string;
    dateModified?: string;
    author?: JsonLdPerson | JsonLdPerson[];
    image?: string | { url?: string };
}

interface MarkdownImagePlacement {
    src: string;
    alt: string;
    beforeNorm: string;
    afterNorm: string;
    chainedFromPrev: boolean;
}

export interface SupabaseFeedCandidate {
    title?: string;
    link: string;
    rawPubDate?: string;
    description?: string;
}

export interface SupabaseArticleContent {
    title?: string;
    heroImageUrl?: string;
    heroAlt?: string;
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
        if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
            return undefined;
        }
        if (parsed.origin === SITE_ORIGIN && parsed.pathname === '/_next/image') {
            const inner = parsed.searchParams.get('url');
            return inner ? toSafeUrl(inner) : undefined;
        }
        return parsed.href;
    } catch {
        return undefined;
    }
};

const normalizeBlogUrl = (raw: string | undefined): string | undefined => {
    const safeUrl = toSafeUrl(raw);
    if (!safeUrl) {
        return undefined;
    }
    const parsed = new URL(safeUrl);
    if (parsed.origin !== SITE_ORIGIN || !parsed.pathname.startsWith('/blog/')) {
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

export const fetchOptionalMarkdown = async (articleUrl: string): Promise<string | undefined> => {
    try {
        return await fetchText(`${articleUrl}.md`);
    } catch {
        return undefined;
    }
};

export const extractFeedCandidates = (xml: string): SupabaseFeedCandidate[] => {
    const $ = load(xml, { xmlMode: true });
    const candidates: SupabaseFeedCandidate[] = [];

    $('item').each((_, el) => {
        const item = $(el);
        const link = normalizeBlogUrl(item.find('link').first().text() || item.find('guid').first().text());
        if (!link) {
            return;
        }
        candidates.push({
            title: item.find('title').first().text() || undefined,
            link,
            rawPubDate: item.find('pubDate').first().text().trim() || undefined,
            description: item.find('description').first().text().trim() || undefined,
        });
    });

    return candidates;
};

const isBlogPostingNode = (node: JsonLdBlogPosting): boolean => {
    const nodeType = node['@type'];
    if (Array.isArray(nodeType)) {
        return nodeType.includes('BlogPosting') || nodeType.includes('Article');
    }
    return nodeType === 'BlogPosting' || nodeType === 'Article';
};

const extractJsonLdPosting = ($: CheerioAPI): JsonLdBlogPosting | undefined => {
    const scripts = $('script[type="application/ld+json"]').toArray();
    for (const scriptEl of scripts) {
        const rawText = $(scriptEl).text();
        if (!rawText) {
            continue;
        }
        try {
            const parsed = JSON.parse(rawText) as JsonLdBlogPosting;
            if (isBlogPostingNode(parsed)) {
                return parsed;
            }
        } catch {
            // Skip malformed JSON-LD blocks
        }
    }
    return undefined;
};

const extractAuthors = ($: CheerioAPI, jsonLd?: JsonLdBlogPosting): string | undefined => {
    const rawAuthor = jsonLd?.author;
    if (rawAuthor) {
        const list = Array.isArray(rawAuthor) ? rawAuthor : [rawAuthor];
        const names = list.map((person) => person.name?.trim()).filter((name): name is string => Boolean(name));
        if (names.length) {
            return names.join(', ');
        }
    }
    const domAuthors = $('main a[href^="/blog/authors/"] span')
        .filter((_, el) => $(el).hasClass('text-foreground'))
        .toArray()
        .map((el) => $(el).text().trim())
        .filter(Boolean);
    return domAuthors.length ? [...new Set(domAuthors)].join(', ') : undefined;
};

const extractCategories = ($: CheerioAPI): string[] => {
    const categories = new Set<string>();
    $('main a[href^="/blog/categories/"], main a[href^="/blog/tags/"]').each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
            categories.add(text);
        }
    });
    return [...categories];
};

const extractHeroImage = ($: CheerioAPI, jsonLd?: JsonLdBlogPosting) => {
    const heroImg = $('main div[class*="aspect-"] img').first();
    const jldImageUrl = typeof jsonLd?.image === 'string' ? jsonLd.image : jsonLd?.image?.url;
    const url = toSafeUrl(heroImg.attr('src') || jldImageUrl);
    const alt = heroImg.attr('alt')?.trim() || undefined;
    return { url, alt };
};

const extractCodeText = ($: CheerioAPI, codeEl: Cheerio<Element>): string => {
    codeEl.find('.ch-code-line-number').remove();
    const lines = codeEl
        .children('div')
        .toArray()
        .map((lineEl) => $(lineEl).text());
    return lines.length ? lines.join('\n') : codeEl.text();
};

const buildPreElement = ($: CheerioAPI, codeText: string) => $('<pre>').append($('<code>').text(codeText));

const collectCodeGroupTabs = ($: CheerioAPI, group: Cheerio<Element>): string[] =>
    group
        .find('.ch-editor-tab')
        .toArray()
        .map((tabEl) => ($(tabEl).attr('title') || $(tabEl).text()).trim())
        .filter((name) => name && name !== 'hideCopy');

const normalizeCodeBlocks = ($: CheerioAPI, container: Cheerio<Element>): void => {
    container.find('.ch-codegroup').each((_, groupEl) => {
        const group = $(groupEl);
        const tabNames = collectCodeGroupTabs($, group);
        const panels = group.find('.ch-code-scroll-parent').toArray();
        if (!panels.length) {
            group.remove();
            return;
        }
        const replacement = $('<div>');
        for (const [index, panelEl] of panels.entries()) {
            const label = tabNames[index];
            if (label) {
                replacement.append($('<p>').append($('<strong>').text(label)));
            }
            const codeText = extractCodeText($, $(panelEl));
            replacement.append(buildPreElement($, codeText));
        }
        group.replaceWith(replacement.contents());
    });

    container.find('.ch-codeblock').each((_, blockEl) => {
        const block = $(blockEl);
        const codeEl = block.find('.ch-code-scroll-parent').first();
        if (!codeEl.length) {
            block.remove();
            return;
        }
        block.replaceWith(buildPreElement($, extractCodeText($, codeEl)));
    });
};

const normalizeMediaElements = ($: CheerioAPI, container: Cheerio<Element>): void => {
    container.find('img').each((_, imgEl) => {
        const img = $(imgEl);
        const safeSrc = toSafeUrl(img.attr('src') || img.attr('data-src'));
        if (!safeSrc) {
            img.remove();
            return;
        }
        img.attr('src', safeSrc).removeAttr('data-src').removeAttr('srcset').removeAttr('sizes').removeAttr('style').removeAttr('class').removeAttr('loading');
    });

    container.find('iframe').each((_, frameEl) => {
        const frame = $(frameEl);
        const safeSrc = toSafeUrl(frame.attr('src') || frame.attr('data-src'));
        if (!safeSrc) {
            frame.remove();
            return;
        }
        frame.attr('src', safeSrc).removeAttr('data-src').removeAttr('class');
    });

    container.find('video').each((_, videoEl) => {
        const video = $(videoEl);
        const poster = toSafeUrl(video.attr('poster'));
        if (poster) {
            video.attr('poster', poster);
        } else {
            video.removeAttr('poster');
        }
        const directSrc = toSafeUrl(video.attr('src'));
        if (directSrc) {
            video.attr('src', directSrc);
        }
        video.find('source').each((__, sourceEl) => {
            const source = $(sourceEl);
            const src = toSafeUrl(source.attr('src'));
            if (src) {
                source.attr('src', src);
            } else {
                source.remove();
            }
        });
        if (!directSrc && !video.find('source').length) {
            video.remove();
            return;
        }
        video.attr('controls', '').removeAttr('class');
    });
};

const normalizeMatchText = (text: string): string => text.replaceAll(/[^\p{L}\p{N}]+/gu, '').toLowerCase();

const stripMarkdownSyntax = (raw: string): string =>
    raw
        .replaceAll(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replaceAll(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replaceAll(/```[\w-]*(?=\r?\n)/g, ' ')
        .replaceAll('```', ' ')
        .replaceAll(/[*_`#>~-]+/g, ' ');

const computeCodeFenceRanges = (markdown: string): Array<[number, number]> => {
    const ranges: Array<[number, number]> = [];
    const fenceRegex = /```[\s\S]*?```/g;
    for (const match of markdown.matchAll(fenceRegex)) {
        const start = match.index;
        ranges.push([start, start + match[0].length]);
    }
    return ranges;
};

const isInsideRanges = (index: number, ranges: Array<[number, number]>): boolean => ranges.some(([start, end]) => index >= start && index < end);

const extractMarkdownImages = (rawMarkdown: string | undefined): MarkdownImagePlacement[] => {
    if (!rawMarkdown) {
        return [];
    }
    const body = rawMarkdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const fenceRanges = computeCodeFenceRanges(body);
    const placements: MarkdownImagePlacement[] = [];
    const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    let prevEnd = 0;

    for (const match of body.matchAll(imageRegex)) {
        const index = match.index;
        if (isInsideRanges(index, fenceRanges)) {
            continue;
        }
        const safeUrl = toSafeUrl(match[2]);
        if (!safeUrl) {
            continue;
        }
        const gapText = body.slice(prevEnd, index);
        const beforeSlice = body.slice(Math.max(0, index - 320), index);
        const afterSlice = body.slice(index + match[0].length, index + match[0].length + 320);
        const beforeNorm = normalizeMatchText(stripMarkdownSyntax(beforeSlice)).slice(-64);
        const afterNorm = normalizeMatchText(stripMarkdownSyntax(afterSlice)).slice(0, 64);
        const chainedFromPrev = Boolean(placements.length && !normalizeMatchText(stripMarkdownSyntax(gapText)));
        placements.push({
            src: safeUrl,
            alt: match[1].trim(),
            beforeNorm,
            afterNorm,
            chainedFromPrev,
        });
        prevEnd = index + match[0].length;
    }

    return placements;
};

const collectExistingBodyImages = ($: CheerioAPI, container: Cheerio<Element>, heroImageUrl?: string): Set<string> => {
    const existing = new Set<string>();
    if (heroImageUrl) {
        existing.add(heroImageUrl);
    }
    container.find('img').each((_, imgEl) => {
        const src = toSafeUrl($(imgEl).attr('src'));
        if (src) {
            existing.add(src);
        }
    });
    return existing;
};

const findAnchorBySuffix = (blockTexts: string[], anchor: string, startIndex: number): number => {
    for (const length of [48, 32, 20, 12]) {
        const needle = anchor.slice(-length);
        if (needle.length < 8) {
            continue;
        }
        for (let i = startIndex; i < blockTexts.length; i++) {
            if (blockTexts[i].includes(needle)) {
                return i;
            }
        }
    }
    return -1;
};

const findAnchorByPrefix = (blockTexts: string[], anchor: string, startIndex: number): number => {
    for (const length of [48, 32, 20, 12]) {
        const needle = anchor.slice(0, length);
        if (needle.length < 8) {
            continue;
        }
        for (let i = startIndex; i < blockTexts.length; i++) {
            if (blockTexts[i].includes(needle)) {
                return i;
            }
        }
    }
    return -1;
};

const buildImageFigure = ($: CheerioAPI, placement: MarkdownImagePlacement) => $('<figure>').append($('<img>').attr('src', placement.src).attr('alt', placement.alt));

const mergeMarkdownImages = ($: CheerioAPI, container: Cheerio<Element>, markdown: string | undefined, heroImageUrl?: string): void => {
    const placements = extractMarkdownImages(markdown);
    if (!placements.length) {
        return;
    }
    const existing = collectExistingBodyImages($, container, heroImageUrl);
    const blocks = container.children().toArray();
    const blockTexts = blocks.map((el) => normalizeMatchText($(el).text()));
    let cursor = 0;
    let lastInserted: ReturnType<typeof buildImageFigure> | undefined;

    for (const placement of placements) {
        if (existing.has(placement.src)) {
            continue;
        }
        existing.add(placement.src);
        const figure = buildImageFigure($, placement);

        if (placement.chainedFromPrev && lastInserted) {
            lastInserted.after(figure);
            lastInserted = figure;
            continue;
        }

        const afterBlockIdx = placement.beforeNorm ? findAnchorBySuffix(blockTexts, placement.beforeNorm, cursor) : -1;
        if (afterBlockIdx !== -1) {
            $(blocks[afterBlockIdx]).after(figure);
            cursor = afterBlockIdx;
            lastInserted = figure;
            continue;
        }

        const beforeBlockIdx = placement.afterNorm ? findAnchorByPrefix(blockTexts, placement.afterNorm, cursor) : -1;
        if (beforeBlockIdx !== -1) {
            $(blocks[beforeBlockIdx]).before(figure);
            cursor = beforeBlockIdx;
            lastInserted = figure;
            continue;
        }

        container.append(figure);
        lastInserted = figure;
    }
};

export const parseArticleDetail = (html: string, fallback: SupabaseFeedCandidate, markdown?: string): SupabaseArticleContent => {
    const $ = load(html);
    const jsonLd = extractJsonLdPosting($);
    const content = $('article .prose').first().length ? $('article .prose').first() : $('article').first();
    $(NOISE_SELECTOR, content).remove();
    normalizeCodeBlocks($, content);
    normalizeMediaElements($, content);

    const hero = extractHeroImage($, jsonLd);
    mergeMarkdownImages($, content, markdown, hero.url);
    const domTitle = $('main h1').first().text();
    const publishedDateOnly = jsonLd?.datePublished?.trim();
    const modifiedDateOnly = jsonLd?.dateModified?.trim();

    return {
        title: fallback.title || jsonLd?.headline || domTitle || undefined,
        heroImageUrl: hero.url,
        heroAlt: hero.alt,
        bodyHtml: content.html() ?? '',
        rawPubDate: fallback.rawPubDate || publishedDateOnly,
        rawUpdatedAt: modifiedDateOnly && modifiedDateOnly !== publishedDateOnly ? modifiedDateOnly : undefined,
        author: extractAuthors($, jsonLd),
        categories: extractCategories($),
    };
};
