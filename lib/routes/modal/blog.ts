import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderFallbackDescription } from './templates/description';

const SITE_URL = 'https://modal.com';
const BLOG_URL = `${SITE_URL}/blog`;
const ATOM_URL = `${BLOG_URL}/atom.xml`;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;

const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const RASTER_IMAGE_EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg', '.gif'];
const MEDIA_KEEP_SELECTOR = 'img, video, audio, table, iframe, svg, math, pre, code, hr';

const MODAL_V2_PALETTE = new Map<string, string>([
    ['--color-v2-primary-pure-black', '#000'],
    ['--color-v2-primary-neutral-0', '#fff'],
    ['--color-v2-primary-neutral-100', '#e3e5e1'],
    ['--color-v2-primary-neutral-400', '#c4c7c1'],
    ['--color-v2-primary-neutral-500', '#a8aba6'],
    ['--color-v2-primary-neutral-600', '#6c6e6a'],
    ['--color-v2-primary-neutral-700', '#4b4d4a'],
    ['--color-v2-primary-neutral-950', '#131412'],
    ['--color-v2-primary-neutral-1000', '#10120f'],
    ['--color-v2-primary-green-200', '#7fee64'],
    ['--figure-background', '#10120f'],
    ['--figure-surface', '#151714'],
    ['--figure-text', '#eef2eb'],
    ['--figure-muted', '#a8aba6'],
    ['--figure-subtle', '#80867c'],
    ['--figure-border', '#4b4d4a'],
    ['--figure-structure', '#fcfffa'],
    ['--figure-grid', '#a8aba6'],
    ['--figure-accent', '#7fee64'],
]);

interface AtomEntry {
    title: string;
    link: string;
    summary: string;
    updated: string;
    authors: string[];
}

interface JsonLdAuthor {
    name?: string;
}

interface JsonLdBlogPosting {
    author: JsonLdAuthor | JsonLdAuthor[];
}

const resolveHttpUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    if (!rawUrl) {
        return undefined;
    }
    try {
        const parsed = new URL(rawUrl, baseUrl);
        return SAFE_HTTP_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

const isDynamicOgCard = (imageUrl: string): boolean => {
    try {
        const { pathname } = new URL(imageUrl);
        return pathname === '/docs/social-image.png' || pathname === '/og' || pathname.startsWith('/og/');
    } catch {
        return false;
    }
};

const isRasterImageUrl = (imageUrl: string): boolean => {
    try {
        const pathname = new URL(imageUrl).pathname.toLowerCase();
        return RASTER_IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
    } catch {
        return false;
    }
};

const extractAtomEntries = ($: CheerioAPI, limit: number): AtomEntry[] =>
    $('feed > entry')
        .toArray()
        .flatMap((el) => {
            const $entry = $(el);
            const title = $entry.children('title').text();
            const rawLink = $entry.children('link[rel="alternate"]').attr('href') || $entry.children('link').attr('href');
            const link = resolveHttpUrl(rawLink, BLOG_URL);
            if (!title || !link) {
                return [];
            }
            const authors = $entry
                .children('author')
                .toArray()
                .map((authorEl) => $(authorEl).children('name').text())
                .filter(Boolean);
            const updated = $entry.children('published').first().text().trim() || $entry.children('updated').text();
            return {
                title,
                link,
                summary: $entry.children('summary').text().trim(),
                updated,
                authors,
            };
        })
        .slice(0, limit);

const extractJsonLdAuthors = ($: CheerioAPI): string[] => {
    const { author } = JSON.parse($('script[type="application/ld+json"]:contains("BlogPosting")').text()) as JsonLdBlogPosting;
    const list = Array.isArray(author) ? author : [author];
    return list.map((item) => item.name).filter((name): name is string => Boolean(name));
};

const extractHeaderMeta = ($: CheerioAPI, articleUrl: string) => {
    const $header = $('article').first().children('header');
    const $headerDivs = $header.children('div');
    const category = $headerDivs.eq(0).children('div').find('span').text();
    const headerAuthors = $headerDivs
        .eq(0)
        .find('span.text-v2-primary-neutral-100')
        .toArray()
        .map((el) => $(el).text())
        .filter(Boolean);
    const heroImage = resolveHttpUrl($headerDivs.eq(1).find('img').attr('src'), articleUrl);

    return { category, headerAuthors, heroImage };
};

const pickCoverImage = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string, heroImage?: string): string | undefined => {
    if (heroImage && !isDynamicOgCard(heroImage)) {
        return heroImage;
    }

    const ogImage = resolveHttpUrl($('meta[property="og:image"]').attr('content'), articleUrl);
    if (ogImage && !isDynamicOgCard(ogImage)) {
        return ogImage;
    }

    let firstFallback: string | undefined;
    for (const el of $body.find('img').toArray()) {
        const resolved = resolveHttpUrl($(el).attr('src'), articleUrl);
        if (!resolved) {
            continue;
        }
        if (isRasterImageUrl(resolved)) {
            return resolved;
        }
        firstFallback ??= resolved;
    }

    return firstFallback ?? ogImage;
};

type AttrTuple = readonly [string, string];

const DIAGRAM_CLASS_VARS = new Map<string, readonly AttrTuple[]>([
    ['ground', [['fill', '--figure-background']]],
    ['primary', [['fill', '--figure-text']]],
    ['body', [['fill', '--figure-text']]],
    ['secondary', [['fill', '--figure-muted']]],
    ['subtle', [['fill', '--figure-subtle']]],
    ['grid', [['stroke', '--figure-grid']]],
    ['axis', [['stroke', '--figure-grid']]],
    ['reference', [['stroke', '--figure-muted']]],
]);

const DIAGRAM_STATIC_ATTRS = new Map<string, readonly AttrTuple[]>([
    [
        'label',
        [
            ['fill', '#e3e5e1'],
            ['font-size', '16px'],
        ],
    ],
    [
        'title',
        [
            ['fill', '#e3e5e1'],
            ['font-size', '15px'],
        ],
    ],
    [
        'pill',
        [
            ['fill', '#8d918a'],
            ['font-size', '11px'],
        ],
    ],
    [
        'sub',
        [
            ['fill', '#8d918a'],
            ['font-size', '13px'],
        ],
    ],
    [
        'term',
        [
            ['fill', '#d4d7d1'],
            ['font-size', '10.5px'],
        ],
    ],
    [
        'grid',
        [
            ['stroke-opacity', '0.25'],
            ['stroke-width', '1'],
        ],
    ],
    [
        'axis',
        [
            ['stroke-opacity', '0.25'],
            ['stroke-width', '1'],
        ],
    ],
    [
        'reference',
        [
            ['stroke-opacity', '0.6'],
            ['stroke-width', '1'],
            ['stroke-dasharray', '5 6'],
        ],
    ],
]);

const extractCssVariables = ($: CheerioAPI): Map<string, string> => {
    const vars = new Map(MODAL_V2_PALETTE);
    for (const styleEl of $('style').toArray()) {
        const cssText = $(styleEl).text();
        for (const match of cssText.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}\n]+)/gi)) {
            const name = match[1];
            const value = match[2].trim();
            if (value && !value.includes('var(')) {
                vars.set(name, value);
            }
        }
    }
    return vars;
};

const resolveCssVars = (rawValue: string, vars: Map<string, string>): string => {
    let resolved = rawValue;
    for (let pass = 0; pass < 2 && resolved.includes('var('); pass++) {
        resolved = resolved.replaceAll(/var\(\s*(--[a-z0-9-]+)\s*(?:,([^)]*))?\)/gi, (_, name: string, fallback?: string) => vars.get(name) ?? fallback?.trim() ?? '');
    }
    return resolved;
};

const setMissingAttr = ($el: Cheerio<Element>, attr: string, val: string | undefined) => {
    if (val && $el.attr(attr) === undefined) {
        $el.attr(attr, val);
    }
};

const applyTailwindSvgToken = ($el: Cheerio<Element>, token: string, vars: Map<string, string>) => {
    if (token === 'fill-v2-primary-green-200/10') {
        setMissingAttr($el, 'fill', '#7fee641a');
        return;
    }
    const prefixMatch = /^(fill|stroke|text)-(v2-primary-[a-z0-9-]+)$/.exec(token);
    if (!prefixMatch) {
        return;
    }
    const attrName = prefixMatch[1] === 'text' ? 'color' : prefixMatch[1];
    setMissingAttr($el, attrName, vars.get(`--color-${prefixMatch[2]}`));
};

const normalizeSvgNode = ($node: Cheerio<Element>, vars: Map<string, string>) => {
    for (const attr of ['fill', 'stroke', 'color', 'stop-color', 'style']) {
        const raw = $node.attr(attr);
        if (raw?.includes('var(')) {
            $node.attr(attr, resolveCssVars(raw, vars));
        }
    }
    const clsList = ($node.attr('class') ?? '').split(/\s+/).filter(Boolean);
    for (const cls of clsList) {
        const classVars = DIAGRAM_CLASS_VARS.get(cls);
        if (classVars) {
            for (const [attr, varName] of classVars) {
                setMissingAttr($node, attr, vars.get(varName));
            }
        }
        const staticAttrs = DIAGRAM_STATIC_ATTRS.get(cls);
        if (staticAttrs) {
            for (const [attr, val] of staticAttrs) {
                setMissingAttr($node, attr, val);
            }
        }
        applyTailwindSvgToken($node, cls, vars);
    }
};

const activateInteractiveSvgState = ($svg: Cheerio<Element>, $: CheerioAPI, vars: Map<string, string>) => {
    const $states = $svg.find('[data-compare-state]');
    if ($states.length > 0) {
        const activeState = $svg.find('[data-compare-button][aria-pressed="true"]').attr('data-compare-button') || $states.attr('data-compare-state');
        for (const el of $states.toArray()) {
            const $state = $(el);
            if ($state.attr('data-compare-state') === activeState) {
                $state.removeAttr('display').removeAttr('aria-hidden');
            } else {
                $state.remove();
            }
        }
    }

    const accent = vars.get('--figure-accent') ?? '#7fee64';
    const bg = vars.get('--figure-background') ?? '#10120f';
    for (const btn of $svg.find('[data-compare-button][aria-pressed="true"]').toArray()) {
        const $btn = $(btn);
        $btn.find('rect').attr('fill', accent).attr('stroke', 'none');
        $btn.find('text').attr('fill', bg);
    }
    $svg.find('[data-compare-button]').removeAttr('style');
    $svg.find('[data-compare-playback], [data-playback-icon]').remove();
};

const normalizeBodySvgs = ($body: Cheerio<Element>, $: CheerioAPI, vars: Map<string, string>) => {
    for (const svgEl of $body.find('svg').toArray()) {
        const $svg = $(svgEl);
        activateInteractiveSvgState($svg, $, vars);
        if ($svg.hasClass('diagram') || $svg.attr('data-import')) {
            setMissingAttr($svg, 'font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
            setMissingAttr($svg, 'width', '100%');
            $svg.removeAttr('height');
        }
        normalizeSvgNode($svg, vars);
        for (const node of $svg.find('*').toArray()) {
            normalizeSvgNode($(node), vars);
        }
    }
};

const pruneNoiseAndStyles = ($body: Cheerio<Element>, $: CheerioAPI, vars: Map<string, string>) => {
    $body.find('dialog.lightbox, .lightbox, [data-lightbox-trigger], [data-lightbox-image], button, [role="tablist"], svg[aria-hidden="true"]').remove();
    normalizeBodySvgs($body, $, vars);
    $body
        .find('[style]')
        .filter((_, el) => $(el).closest('svg').length === 0)
        .removeAttr('style');
    $body
        .find('*')
        .addBack()
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();
};

const normalizeMediaElements = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('video').each((_, el) => {
        const $video = $(el);
        $video.removeAttr('aria-hidden').removeAttr('tabindex');
        if ($video.attr('controls') === undefined) {
            $video.attr('controls', '');
        }
    });
    $body.find('img').each((_, el) => {
        $(el).removeAttr('loading').removeAttr('decoding').removeAttr('fetchpriority');
    });
};

const pruneEmptyDivs = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('div').each((_, el) => {
        const $el = $(el);
        const hasText = $el.text().replaceAll('\u{A0}', '').trim().length > 0;
        if (!hasText && $(MEDIA_KEEP_SELECTOR, el).length === 0) {
            $el.remove();
        }
    });
};

const extractArticleDetails = ($: CheerioAPI, entry: AtomEntry) => {
    const cssVars = extractCssVariables($);
    const { category, headerAuthors, heroImage } = extractHeaderMeta($, entry.link);
    const rawAuthors = headerAuthors.length > 0 ? headerAuthors : entry.authors.length > 0 ? entry.authors : extractJsonLdAuthors($);
    const mergedAuthors = rawAuthors.filter(Boolean);
    const author = mergedAuthors.length > 0 ? mergedAuthors.join(', ') : undefined;
    const metaDescription = $('meta[name="description"]').attr('content')?.trim();

    const $body = $('.article-body');
    if ($body.length === 0) {
        return {
            bodyHtml: '',
            image: pickCoverImage($, $body, entry.link, heroImage),
            category: category ? [category] : undefined,
            author,
            metaDescription,
        };
    }

    pruneNoiseAndStyles($body, $, cssVars);
    normalizeMediaElements($body, $);
    pruneEmptyDivs($body, $);

    const hasContent = Boolean($body.text().trim()) || $(MEDIA_KEEP_SELECTOR, $body).length > 0;
    const bodyHtml = hasContent ? $body.html() : '';

    return {
        bodyHtml,
        image: pickCoverImage($, $body, entry.link, heroImage),
        category: category ? [category] : undefined,
        author,
        metaDescription,
    };
};

const fetchArticleDetail = (entry: AtomEntry) =>
    cache.tryGet(`modal:blog:${entry.link}`, async () => {
        const html = await ofetch<string>(entry.link);
        const $ = load(html);
        const { bodyHtml, image, category, author, metaDescription } = extractArticleDetails($, entry);
        const description = bodyHtml || renderFallbackDescription(entry.summary || metaDescription, entry.link, entry.title);

        const dataItem: DataItem = {
            title: entry.title,
            link: entry.link,
            description,
            pubDate: entry.updated ? parseDate(entry.updated) : undefined,
            author,
            category,
            image,
        };

        return dataItem;
    });

async function handler(ctx: Context): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const atomXml = await ofetch(ATOM_URL, { responseType: 'text' });
    const $feed = load(atomXml, { xmlMode: true });
    const entries = extractAtomEntries($feed, limit);

    const items = await pMap(entries, (entry) => fetchArticleDetail(entry), {
        concurrency: DETAIL_CONCURRENCY,
    });

    const feedTitle = $feed('feed > title').text() || 'Modal Blog';
    const feedSubtitle = $feed('feed > subtitle').first().text().trim() || 'Engineering deep dives, product updates, and stories from Modal.';

    return {
        title: feedTitle,
        description: feedSubtitle,
        link: BLOG_URL,
        language: 'en',
        item: items,
    };
}

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'modal.com/blog',
    example: '/modal/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description:
        'Full-text articles, engineering deep dives, product updates, and customer stories from the official Modal blog. Fetches up to 20 entries by default via the official Atom feed; supports the common `limit` parameter.',
    zh: {
        name: '博客',
        description: '通过官方 Atom Feed 发现并抓取 Modal 官方博客全文（涵盖工程实践、产品发布、研究文章与客户案例），默认获取最多 20 篇，支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['modal.com/blog', 'modal.com/blog/:slug', 'modal.com/blog/atom.xml'],
            target: '/blog',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    handler,
};
