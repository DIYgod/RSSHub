import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const SITE_URL = 'https://cohere.com';
const BLOG_URL = `${SITE_URL}/blog`;
const SANITY_QUERY_URL = 'https://rjtqmwfu.apicdn.sanity.io/v2023-05-03/data/query/web3-prod';
const GHOST_POSTS_URL = 'https://cohere-ai.ghost.io/ghost/api/content/posts';
const GHOST_CONTENT_KEY = '572d288a9364f8e4186af1d60a';

interface SanitySpan {
    _type?: string;
    text?: string;
    body?: string;
    marks?: string[];
}

interface SanityMarkDef {
    _key: string;
    _type: string;
    href?: string;
    anchorLink?: string;
}

interface SanityCta {
    label?: string;
    url?: string;
}

interface SanityFaqItem {
    question?: string;
    answer?: SanityBlock[];
}

interface SanityBlock {
    _type: string;
    style?: string;
    listItem?: string;
    level?: number;
    children?: SanitySpan[];
    markDefs?: SanityMarkDef[];
    url?: string;
    alt?: string;
    caption?: string;
    portableCaption?: SanityBlock[];
    code?: string;
    language?: string;
    body?: string;
    html?: string;
    rows?: Array<{ cells?: string[] }>;
    portableQuoteBody?: SanityBlock[];
    portableAuthor?: SanityBlock[];
    posterUrl?: string;
    playbackId?: string;
    audioUrl?: string;
    primaryCta?: SanityCta;
    secondaryCta?: SanityCta;
    title?: string;
    items?: SanityFaqItem[];
}

interface CohereBlogPost {
    title: string;
    subtitle?: string | null;
    slug: string;
    date?: string | null;
    authors?: Array<string | null> | null;
    tags?: Array<string | string[] | null> | null;
    heroUrl?: string | null;
    heroAlt?: string | null;
    ogUrl?: string | null;
    keyTakeaways?: SanityBlock[] | null;
    body?: SanityBlock[] | null;
}

interface SanityQueryResponse {
    result: CohereBlogPost[];
}

interface GhostPost {
    title: string;
    slug: string;
    html?: string | null;
    excerpt?: string | null;
    published_at?: string | null;
    feature_image?: string | null;
    feature_image_alt?: string | null;
    feature_image_caption?: string | null;
    og_image?: string | null;
    authors?: Array<{ name?: string | null }> | null;
    tags?: Array<{ name?: string | null; visibility?: string | null }> | null;
}

interface GhostPostsResponse {
    posts: GhostPost[];
}

const HEADING_MAP: Record<string, string> = {
    h1: 'h2',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h2',
    h6: 'h3',
};

const DECORATOR_MAP: Record<string, [string, string]> = {
    strong: ['<strong>', '</strong>'],
    em: ['<em>', '</em>'],
    code: ['<code>', '</code>'],
    underline: ['<u>', '</u>'],
    sup: ['<sup>', '</sup>'],
    sub: ['<sub>', '</sub>'],
};

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const resolveSafeUrl = (raw?: string): string | undefined => {
    if (!raw) {
        return undefined;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
        return undefined;
    }
    if (trimmed.startsWith('#')) {
        return trimmed;
    }
    try {
        const parsed = new URL(trimmed, SITE_URL);
        if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
            return parsed.href;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

const assetFilename = (url: string) => {
    try {
        const { pathname } = new URL(url, SITE_URL);
        return pathname.slice(pathname.lastIndexOf('/') + 1);
    } catch {
        return url;
    }
};

const youtubeIdFromUrl = (raw: string): string | undefined => {
    try {
        const parsed = new URL(raw, SITE_URL);
        if (parsed.hostname === 'youtu.be') {
            const id = parsed.pathname.slice(1).split('/', 1)[0];
            return id && /^[\w-]{11}$/.test(id) ? id : undefined;
        }
        if (parsed.hostname.endsWith('youtube.com') || parsed.hostname.endsWith('youtube-nocookie.com')) {
            const paramId = parsed.searchParams.get('v');
            if (paramId && /^[\w-]{11}$/.test(paramId)) {
                return paramId;
            }
            const segments = parsed.pathname.split('/').filter(Boolean);
            const idx = segments.findIndex((seg) => ['embed', 'shorts', 'live'].includes(seg));
            const pathId = idx === -1 ? undefined : segments[idx + 1];
            return pathId && /^[\w-]{11}$/.test(pathId) ? pathId : undefined;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

const renderSpans = (children: SanitySpan[] = [], markDefs: SanityMarkDef[] = []) => {
    const defMap = new Map(markDefs.map((def) => [def._key, def]));
    return children
        .filter((child) => child._type === 'span' || child._type === 'latex' || child.text !== undefined)
        .map((span) => {
            if (span._type === 'latex') {
                const latex = span.body?.trim();
                return latex ? `<code>${escapeHtml(latex)}</code>` : '';
            }
            let html = escapeHtml(span.text ?? '').replaceAll('\n', '<br />');
            const spanMarks = span.marks ?? [];
            for (const mark of spanMarks) {
                const decorator = DECORATOR_MAP[mark];
                if (decorator) {
                    html = `${decorator[0]}${html}${decorator[1]}`;
                    continue;
                }
                const def = defMap.get(mark);
                if (def?._type === 'link') {
                    const href = resolveSafeUrl(def.href);
                    if (href) {
                        html = `<a href="${escapeHtml(href)}">${html}</a>`;
                    }
                } else if (def?._type === 'anchor' && def.anchorLink) {
                    html = `<span id="${escapeHtml(def.anchorLink)}">${html}</span>`;
                }
            }
            return html;
        })
        .join('');
};

const renderTableRow = (cells: string[] = [], cellTag: 'th' | 'td') => `<tr>${cells.map((cell) => `<${cellTag}>${escapeHtml(cell).replaceAll('\n', '<br />')}</${cellTag}>`).join('')}</tr>`;

const renderTableBlock = (rows: Array<{ cells?: string[] }> = []) => {
    const nonEmptyRows = rows.filter((row) => row.cells?.length);
    if (!nonEmptyRows.length) {
        return '';
    }

    if (nonEmptyRows.length === 1) {
        return `<table><tbody>${renderTableRow(nonEmptyRows[0].cells, 'td')}</tbody></table>`;
    }
    const thead = `<thead>${renderTableRow(nonEmptyRows[0].cells, 'th')}</thead>`;
    const tbody = `<tbody>${nonEmptyRows
        .slice(1)
        .map((row) => renderTableRow(row.cells, 'td'))
        .join('')}</tbody>`;
    return `<table>${thead}${tbody}</table>`;
};

const renderEmbedHtml = (rawHtml?: string) => {
    if (!rawHtml) {
        return '';
    }
    const $ = load(rawHtml, null, false);
    $('style, script').remove();
    return $.html().trim();
};

const renderSpecialBlock = (block: SanityBlock): string => {
    switch (block._type) {
        case 'image': {
            const url = resolveSafeUrl(block.url);
            if (!url) {
                return '';
            }
            const alt = escapeHtml(block.alt ?? '');
            const caption = block.portableCaption?.length ? renderBlocks(block.portableCaption) : block.caption ? `<p>${escapeHtml(block.caption)}</p>` : '';
            return `<figure><img src="${escapeHtml(url)}" alt="${alt}" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
        }
        case 'codeBlock': {
            if (!block.code) {
                return '';
            }
            const langAttr = block.language ? ` class="language-${escapeHtml(block.language)}"` : '';
            return `<pre><code${langAttr}>${escapeHtml(block.code)}</code></pre>`;
        }
        case 'latex': {
            const latex = block.body?.trim();
            return latex ? `<pre><code class="language-latex">${escapeHtml(latex)}</code></pre>` : '';
        }
        case 'tableBlock':
            return renderTableBlock(block.rows);
        case 'embedHTML':
            return renderEmbedHtml(block.html);
        case 'quoteBlock': {
            const quoteHtml = renderBlocks(block.portableQuoteBody);
            if (!quoteHtml) {
                return '';
            }
            const authorHtml = renderBlocks(block.portableAuthor);
            return `<blockquote>${quoteHtml}${authorHtml ? `<cite>${authorHtml}</cite>` : ''}</blockquote>`;
        }
        case 'embeddedVideo': {
            const poster = resolveSafeUrl(block.posterUrl);
            if (block.playbackId) {
                const posterAttr = poster ? ` poster="${escapeHtml(poster)}"` : '';
                return `<video controls${posterAttr}><source src="https://stream.mux.com/${escapeHtml(block.playbackId)}.m3u8" type="application/x-mpegURL" /></video>`;
            }
            return poster ? `<figure><img src="${escapeHtml(poster)}" alt="" /></figure>` : '';
        }
        case 'audioEmbed': {
            const audioUrl = resolveSafeUrl(block.audioUrl);
            return audioUrl ? `<audio controls src="${escapeHtml(audioUrl)}"></audio>` : '';
        }
        case 'youtube': {
            const url = resolveSafeUrl(block.url);
            if (!url) {
                return '';
            }
            const id = youtubeIdFromUrl(url);
            return id ? `<iframe src="https://www.youtube.com/embed/${escapeHtml(id)}" allowfullscreen></iframe>` : `<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`;
        }
        case 'divider':
            return '<hr />';
        case 'ctaButtons': {
            const ctas = [block.primaryCta, block.secondaryCta]
                .map((cta) => {
                    const href = resolveSafeUrl(cta?.url);
                    const label = cta?.label?.trim();
                    return href && label ? `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>` : '';
                })
                .filter(Boolean);
            return ctas.length ? `<p>${ctas.join(' · ')}</p>` : '';
        }
        case 'blogFaqSection': {
            const itemsHtml = (block.items ?? [])
                .map((faq) => {
                    const question = faq.question?.trim();
                    const answerHtml = renderBlocks(faq.answer);
                    if (!question && !answerHtml) {
                        return '';
                    }
                    return `${question ? `<h3>${escapeHtml(question)}</h3>` : ''}${answerHtml}`;
                })
                .filter(Boolean)
                .join('');
            if (!itemsHtml) {
                return '';
            }
            const heading = block.title?.trim();
            return `${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}${itemsHtml}`;
        }
        default:
            return '';
    }
};

function renderBlocks(blocks: SanityBlock[] = []): string {
    const out: string[] = [];
    const listStack: Array<{ tag: 'ul' | 'ol'; level: number; liOpen: boolean }> = [];

    const closeListsTo = (targetLevel: number) => {
        while (listStack.length > 0 && listStack.at(-1)!.level > targetLevel) {
            const top = listStack.pop()!;
            if (top.liOpen) {
                out.push('</li>');
            }
            out.push(`</${top.tag}>`);
        }
    };

    for (const block of blocks) {
        if (block._type === 'block' && block.listItem) {
            const tag: 'ul' | 'ol' = block.listItem === 'number' ? 'ol' : 'ul';
            const level = Math.max(block.level ?? 1, 1);
            const inner = renderSpans(block.children, block.markDefs);

            closeListsTo(level);

            const currentTop = listStack.at(-1);
            if (currentTop && currentTop.level === level && currentTop.tag !== tag) {
                closeListsTo(level - 1);
            }

            if (listStack.length === 0 || listStack.at(-1)!.level < level) {
                while (listStack.length < level) {
                    out.push(`<${tag}>`);
                    listStack.push({ tag, level: listStack.length + 1, liOpen: false });
                }
            } else if (listStack.at(-1)!.liOpen) {
                out.push('</li>');
                listStack.at(-1)!.liOpen = false;
            }

            out.push(`<li>${inner}`);
            listStack.at(-1)!.liOpen = true;
            continue;
        }

        closeListsTo(0);

        if (block._type === 'block') {
            const inner = renderSpans(block.children, block.markDefs);
            if (!inner.replaceAll('<br />', '').trim()) {
                continue;
            }
            const tag = HEADING_MAP[block.style ?? 'normal'] ?? 'p';
            out.push(`<${tag}>${inner}</${tag}>`);
            continue;
        }

        const rendered = renderSpecialBlock(block);
        if (rendered) {
            out.push(rendered);
        }
    }

    closeListsTo(0);
    return out.join('');
}

const renderDescription = (post: CohereBlogPost): { html: string; hasMainBody: boolean } => {
    const parts: string[] = [];
    const body = post.body ?? [];

    const heroUrl = resolveSafeUrl(post.heroUrl ?? undefined);
    if (heroUrl) {
        const heroFile = assetFilename(heroUrl);
        const alreadyInBody = body.some((block) => {
            const url = block._type === 'image' ? block.url : block._type === 'embeddedVideo' ? block.posterUrl : undefined;
            return Boolean(url && assetFilename(url) === heroFile);
        });
        if (!alreadyInBody) {
            const alt = escapeHtml(post.heroAlt ?? '');
            parts.push(`<figure><img src="${escapeHtml(heroUrl)}" alt="${alt}" /></figure>`);
        }
    }

    const subtitle = post.subtitle?.trim();
    if (subtitle) {
        parts.push(`<p><em>${escapeHtml(subtitle)}</em></p>`);
    }

    if (post.keyTakeaways?.length) {
        const takeawaysHtml = renderBlocks(post.keyTakeaways);
        if (takeawaysHtml) {
            parts.push(`<h2>Key takeaways</h2>${takeawaysHtml}`);
        }
    }

    const bodyHtml = renderBlocks(body);
    if (bodyHtml) {
        parts.push(bodyHtml);
    }

    return {
        html: parts.join(''),
        hasMainBody: Boolean(bodyHtml),
    };
};

const renderGhostDescription = (post: GhostPost): { html: string; hasMainBody: boolean } => {
    const $ = load(post.html ?? '', null, false);
    $('script, style').remove();
    $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src?.startsWith('http://')) {
            $(el).attr('src', src.replace(/^http:\/\//, 'https://'));
        } else if (src?.startsWith('/')) {
            const resolved = resolveSafeUrl(src);
            if (resolved) {
                $(el).attr('src', resolved);
            }
        }
    });
    $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href?.startsWith('/')) {
            return;
        }
        const resolved = resolveSafeUrl(href);
        if (resolved) {
            $(el).attr('href', resolved);
        }
    });

    const parts: string[] = [];
    const featureUrl = resolveSafeUrl(post.feature_image ?? undefined)?.replace(/^http:\/\//, 'https://');
    if (featureUrl) {
        const featureFile = assetFilename(featureUrl);
        const alreadyInBody = $('img')
            .toArray()
            .some((el) => {
                const src = $(el).attr('src');
                return Boolean(src && assetFilename(src) === featureFile);
            });
        if (!alreadyInBody) {
            const alt = escapeHtml(post.feature_image_alt ?? '');
            const caption = post.feature_image_caption ? load(post.feature_image_caption, null, false).text().trim() : '';
            parts.push(`<figure><img src="${escapeHtml(featureUrl)}" alt="${alt}" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`);
        }
    }

    const bodyHtml = $.html().trim();
    if (bodyHtml) {
        parts.push(bodyHtml);
    } else if (post.excerpt?.trim()) {
        parts.push(`<p>${escapeHtml(post.excerpt.trim())}</p>`);
    }

    return {
        html: parts.join(''),
        hasMainBody: Boolean(bodyHtml),
    };
};

const normalizeBlogLink = (slug: string) =>
    `${BLOG_URL}/${slug
        .replace(/^\/+/, '')
        .replace(/^blog\//, '')
        .replace(/\/+$/, '')}`;

const parseBlogDate = (value?: string | null) => (value ? parseDate(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value) : undefined);

const toValidTimestamp = (pubDate?: DataItem['pubDate']) => {
    if (!(pubDate instanceof Date)) {
        return 0;
    }
    const time = pubDate.getTime();
    return Number.isFinite(time) ? time : 0;
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'cohere.com/blog',
    maintainers: ['Loongphy', 'ljh12138164'],
    handler,
    example: '/cohere/blog',
    parameters: {},
    description:
        'Full-text articles from the Cohere Blog (merging both official CMS sources), including key takeaways, formulas, FAQs, code blocks, tables, and embedded media. Fetches 20 entries by default; use the common `limit` query parameter (1-100) to adjust.',
    zh: {
        name: '博客',
        parameters: {},
        description: '合并读取 Cohere 官方博客双 CMS 接口获取英文全文，包含要点总结、公式、FAQ 问答、代码块、表格与内嵌媒体。默认获取 20 篇，可通过通用 `limit` 参数（1-100）调整条数。',
    },
    categories: ['blog'],
    view: ViewType.Articles,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cohere.com/blog', 'cohere.com/blog/:slug'],
            target: '/blog',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, 20), 100);
    const groqQuery = `*[_type == "blogPost" && defined(slug.current) && string::startsWith(slug.current, "blog/") && (!defined(language) || language == "en-US")] | order(coalesce(date, _createdAt) desc) [0...${limit}] {
        title,
        subtitle,
        "slug": slug.current,
        date,
        "authors": authorReferences[]->fullName,
        "tags": tagReferences[]->tag,
        "heroUrl": heroImage.file.asset->url,
        "heroAlt": coalesce(heroImage.file.altText, heroImage.alt, seoTitle),
        "ogUrl": openGraphImage.asset->url,
        keyTakeaways,
        body[]{
            ...,
            _type == "image" => { ..., "url": coalesce(url, asset->url, file.asset->url) },
            _type == "embeddedVideo" => { ..., "posterUrl": fallbackImage.file.asset->url, "playbackId": video.asset->playbackId },
            _type == "audioEmbed" => { ..., "audioUrl": file.asset->url }
        }
    }`;

    const [sanityRes, ghostRes] = await Promise.all([
        ofetch<SanityQueryResponse>(SANITY_QUERY_URL, {
            query: { query: groqQuery },
        }),
        ofetch<GhostPostsResponse>(GHOST_POSTS_URL, {
            query: {
                key: GHOST_CONTENT_KEY,
                limit,
                include: ['authors', 'tags'],
                filter: 'tag:-hash-hidden+tag:-llmu',
            },
        }),
    ]);

    const byLink = new Map<string, { item: DataItem; timestamp: number; hasMainBody: boolean }>();

    const sanityPosts = sanityRes.result ?? [];
    for (const post of sanityPosts) {
        const link = normalizeBlogLink(post.slug);
        if (byLink.has(link)) {
            continue;
        }
        const categories = [...new Set((post.tags ?? []).flat().filter((tag): tag is string => Boolean(tag?.trim())))];
        const authors = (post.authors ?? []).filter((author): author is string => Boolean(author?.trim()));
        const image = resolveSafeUrl(post.ogUrl ?? undefined) ?? resolveSafeUrl(post.heroUrl ?? undefined);
        const rawPubDate = parseBlogDate(post.date);
        const timestamp = toValidTimestamp(rawPubDate);
        const { html: description, hasMainBody } = renderDescription(post);

        byLink.set(link, {
            timestamp,
            hasMainBody,
            item: {
                title: post.title,
                link,
                description,
                pubDate: timestamp ? rawPubDate : undefined,
                author: authors.length ? authors.join(', ') : undefined,
                category: categories.length ? categories : undefined,
                image,
            },
        });
    }

    const ghostPosts = ghostRes.posts ?? [];
    for (const post of ghostPosts) {
        const link = normalizeBlogLink(post.slug);
        const categories = [...new Set((post.tags ?? []).filter((tag) => tag.visibility !== 'internal' && tag.name && !tag.name.startsWith('#')).map((tag) => tag.name!.trim()))];
        const authors = (post.authors ?? []).map((author) => author.name?.trim()).filter((name): name is string => Boolean(name));
        const image = resolveSafeUrl(post.og_image ?? undefined) ?? resolveSafeUrl(post.feature_image ?? undefined);
        const rawPubDate = parseBlogDate(post.published_at);
        const timestamp = toValidTimestamp(rawPubDate);
        const pubDate = timestamp ? rawPubDate : undefined;
        const author = authors.length ? authors.join(', ') : undefined;
        const category = categories.length ? categories : undefined;

        const existing = byLink.get(link);
        if (existing) {
            existing.item.title ||= post.title;
            if (!existing.hasMainBody) {
                const ghostDescription = renderGhostDescription(post);
                if (ghostDescription.hasMainBody || (!existing.item.description && ghostDescription.html)) {
                    existing.item.description = ghostDescription.html;
                    existing.hasMainBody = ghostDescription.hasMainBody;
                }
            }
            if (!existing.item.pubDate && pubDate) {
                existing.item.pubDate = pubDate;
                existing.timestamp = timestamp;
            }
            existing.item.author ||= author;
            existing.item.category ||= category;
            existing.item.image ||= image;
            continue;
        }

        const { html: description, hasMainBody } = renderGhostDescription(post);
        byLink.set(link, {
            timestamp,
            hasMainBody,
            item: {
                title: post.title,
                link,
                description,
                pubDate,
                author,
                category,
                image,
            },
        });
    }

    const items = byLink
        .values()
        .toArray()
        .toSorted((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .map((entry) => entry.item);

    return {
        title: 'The Cohere Blog',
        link: BLOG_URL,
        language: 'en',
        item: items,
    };
}
