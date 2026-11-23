import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { renderYoutube } from '@/routes/youtube/utils';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderAudioSample, renderDescription, renderEmbed, renderFallbackDescription, renderVideo } from './templates/description';

const TOGETHER_ORIGIN = 'https://www.together.ai';
const BLOG_URL = `${TOGETHER_ORIGIN}/blog`;
const RSS_URL = `${BLOG_URL}/rss.xml`;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;

const TOGETHER_HOSTS = ['together.ai', 'www.together.ai'] as const;
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be'] as const;
const VIMEO_HOSTS = ['player.vimeo.com', 'vimeo.com', 'www.vimeo.com'] as const;
const VIDEO_ID_RE = /^[\w-]{6,64}$/;
const NUMERIC_ID_RE = /^\d+$/;
const AUTHOR_BY_RE = /^\s*by\s+/i;

interface RssEntry {
    title: string;
    link: string;
    pubDateRaw: string;
    excerpt: string;
    rssImage?: string;
}

interface JsonLdAuthor {
    name?: string;
    url?: string;
}

interface JsonLdPosting {
    '@type'?: string;
    '@graph'?: JsonLdPosting[];
    headline?: string;
    datePublished?: string;
    image?: string | { url?: string };
    author?: JsonLdAuthor;
}

interface ParsedDetail {
    title?: string;
    description?: string;
    pubDateRaw?: string;
    author?: DataItem['author'];
    category?: string[];
    image?: string;
}

interface CleanedBody {
    bodyHtml: string;
    firstBodyImage?: string;
    hasHeroImage: boolean;
}

const isAllowedHost = (hostname: string, allowlist: readonly string[]): boolean => {
    const normalized = hostname.toLowerCase();
    return allowlist.some((domain) => normalized === domain || normalized.endsWith(`.${domain}`));
};

const parseHttpUrl = (rawUrl: string | undefined, base: string = TOGETHER_ORIGIN): URL | undefined => {
    if (!rawUrl) {
        return undefined;
    }
    const parsed = URL.parse(rawUrl, base);
    return parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed : undefined;
};

const parseArticleUrl = (rawUrl: string): string | undefined => {
    const parsed = URL.parse(rawUrl, TOGETHER_ORIGIN);
    if (!parsed || parsed.protocol !== 'https:' || !isAllowedHost(parsed.hostname, TOGETHER_HOSTS) || !parsed.pathname.startsWith('/blog/') || parsed.pathname === '/blog/') {
        return undefined;
    }
    return parsed.href;
};

const extractRssExcerpt = (rawDescription: string): string => {
    if (!rawDescription) {
        return '';
    }
    const $desc = load(rawDescription, null, false);
    return $desc.root().text().replaceAll(/\s+/g, ' ').trim();
};

const parseRssFeed = (xml: string, limit: number): RssEntry[] => {
    const $ = load(xml, { xml: true });
    return $('rss > channel > item')
        .toArray()
        .flatMap((el) => {
            const $item = $(el);
            const title = $item.find('title').text();
            const link = parseArticleUrl($item.find('link').text());
            if (!link) {
                return [];
            }

            const mediaEl = $item.find(String.raw`media\:content, media\:thumbnail, enclosure`);
            const rssImage = parseHttpUrl(mediaEl.attr('url'), link)?.href;
            return {
                title,
                link,
                pubDateRaw: $item.find('pubDate').text(),
                excerpt: extractRssExcerpt($item.find('description').text()),
                rssImage,
            };
        })
        .slice(0, limit);
};

const findBlogPosting = (parsed: JsonLdPosting): JsonLdPosting | undefined => {
    const items = parsed['@graph'] ?? [parsed];
    return items.find((item) => item['@type'] === 'BlogPosting' || item['@type'] === 'Article');
};

const extractJsonLdPosting = ($: CheerioAPI): JsonLdPosting | undefined => findBlogPosting(JSON.parse($('script[type="application/ld+json"]:contains("BlogPosting")').text()));

const splitOutsideParens = (input: string, delimiter: string): string[] => {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    let idx = 0;

    while (idx < input.length) {
        const ch = input[idx];
        if (ch === '(') {
            depth++;
        } else if (ch === ')' && depth > 0) {
            depth--;
        } else if (depth === 0 && input.startsWith(delimiter, idx)) {
            parts.push(input.slice(start, idx));
            idx += delimiter.length;
            start = idx;
            continue;
        }
        idx++;
    }

    parts.push(input.slice(start));
    return parts;
};

const parseAuthorNames = (rawNames: string): string[] => {
    const cleaned = rawNames.replace(AUTHOR_BY_RE, '').trim();
    if (!cleaned) {
        return [];
    }

    return splitOutsideParens(cleaned, ',')
        .flatMap((chunk) => splitOutsideParens(chunk, ' and '))
        .map((piece) => piece.trim())
        .filter(Boolean);
};

const extractLdAuthors = (posting: JsonLdPosting | undefined): DataItem['author'] | undefined => {
    const rawName = posting?.author?.name?.trim();
    if (!rawName) {
        return undefined;
    }
    const parsed = parseAuthorNames(rawName);
    if (parsed.length === 0) {
        return undefined;
    }
    const url = parsed.length === 1 ? parseHttpUrl(posting?.author?.url, TOGETHER_ORIGIN)?.href : undefined;
    return parsed.map((name) => (url ? { name, url } : { name }));
};

const extractLdImageUrl = (posting: JsonLdPosting | undefined, articleUrl: string): string | undefined => {
    if (!posting?.image) {
        return undefined;
    }
    if (typeof posting.image === 'string') {
        return parseHttpUrl(posting.image, articleUrl)?.href;
    }
    return parseHttpUrl(posting.image.url, articleUrl)?.href;
};

const extractCategories = ($: CheerioAPI): string[] | undefined => {
    const list = $('.blog-detail_wrap .tag')
        .toArray()
        .map((el) => $(el).text().replaceAll(/\s+/g, ' '))
        .filter(Boolean);
    return list.length > 0 ? list : undefined;
};

const resolveYouTubeId = (parsed: URL): string | undefined => {
    const segments = parsed.pathname.split('/').filter(Boolean);
    const id = segments[0] === 'embed' || segments[0] === 'shorts' ? segments[1] : parsed.hostname === 'youtu.be' ? segments[0] : (parsed.searchParams.get('v') ?? undefined);
    return id && VIDEO_ID_RE.test(id) ? id : undefined;
};

const renderIframeEmbed = (rawSrc: string | undefined, articleUrl: string, title: string | undefined): string | undefined => {
    const parsed = parseHttpUrl(rawSrc, articleUrl);
    if (!parsed) {
        return undefined;
    }
    if (isAllowedHost(parsed.hostname, YOUTUBE_HOSTS)) {
        const id = resolveYouTubeId(parsed);
        return id ? renderYoutube(true, id) : renderEmbed(parsed.href, parsed.href, title);
    }
    if (isAllowedHost(parsed.hostname, VIMEO_HOSTS)) {
        const segments = parsed.pathname.split('/').filter(Boolean);
        const videoId = segments[0] === 'video' ? segments[1] : segments[0];
        const watchUrl = videoId && NUMERIC_ID_RE.test(videoId) ? `https://vimeo.com/${videoId}` : parsed.href;
        return renderEmbed(parsed.href, watchUrl, title);
    }
    return undefined;
};

const replaceHowlerPlayers = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string) => {
    $body.find('[data-howler-src]').each((_, el) => {
        const $player = $(el);
        const audioUrl = parseHttpUrl($player.attr('data-howler-src'), articleUrl)?.href;
        if (!audioUrl) {
            $player.remove();
            return;
        }
        const label = $player.find('.howler-player__title').first().text().replaceAll(/\s+/g, ' ').trim();
        $player.replaceWith(renderAudioSample(audioUrl, label || undefined));
    });
};

const normalizeVideos = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string) => {
    $body.find('video').each((_, el) => {
        const $video = $(el);
        const $source = $video.find('source[src]');
        const videoUrl = parseHttpUrl($video.attr('src') || $source.attr('src'), articleUrl)?.href;
        if (!videoUrl) {
            $video.remove();
            return;
        }
        const posterUrl = parseHttpUrl($video.attr('poster'), articleUrl)?.href;
        const explicitType = $source.attr('type');
        const videoType = explicitType || (videoUrl.toLowerCase().includes('.webm') ? 'video/webm' : 'video/mp4');
        const rendered = renderVideo(videoUrl, videoType, posterUrl);
        const $embedParent = $video.parent('.w-embed');
        if ($embedParent.length && $embedParent.children().length === 1) {
            $embedParent.replaceWith(rendered);
        } else {
            $video.replaceWith(rendered);
        }
    });
};

const cleanIframes = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string) => {
    $body.find('iframe').each((_, el) => {
        const $frame = $(el);
        const rendered = renderIframeEmbed($frame.attr('src') || $frame.attr('data-src'), articleUrl, $frame.attr('title')?.trim());
        if (!rendered) {
            $frame.remove();
            return;
        }
        const $embedParent = $frame.parent('.w-embed, .w-video');
        if ($embedParent.length && $embedParent.children().length === 1) {
            $embedParent.replaceWith(rendered);
        } else {
            $frame.replaceWith(rendered);
        }
    });
};

const stripDataWfAttrs = ($: CheerioAPI, $body: Cheerio<Element>) => {
    $body.find('*').each((_, el) => {
        const attribs = el.attribs;
        if (!attribs) {
            return;
        }
        const $el = $(el);
        for (const name of Object.keys(attribs)) {
            if (name === 'style' || name === 'tabindex' || name.startsWith('data-wf-')) {
                $el.removeAttr(name);
            }
        }
    });
};

const cleanBodyHtml = ($: CheerioAPI, articleUrl: string): CleanedBody => {
    const $body = $('article.blog-detail_main');
    const $target = $body.length ? $body : $('.blog-detail_article');
    if (!$target.length) {
        return { bodyHtml: '', hasHeroImage: false };
    }

    replaceHowlerPlayers($, $target, articleUrl);
    normalizeVideos($, $target, articleUrl);
    cleanIframes($, $target, articleUrl);
    $target.find('button, svg').remove();

    $target.find('h1').each((_, el) => {
        el.tagName = 'h2';
    });

    $target.find('img').each((_, el) => {
        const $img = $(el);
        if (!parseHttpUrl($img.attr('src'), articleUrl)) {
            $img.remove();
        }
    });

    stripDataWfAttrs($, $target);
    const firstBodyImage = parseHttpUrl($target.find('img').attr('src'), articleUrl)?.href;
    const hasHeroImage = $target.find('figure.blog-detail_main-img img').length > 0;

    return {
        bodyHtml: $target.html() ?? '',
        firstBodyImage,
        hasHeroImage,
    };
};

const extractSlugFallback = (link: string): string => link.split('/').findLast(Boolean) || link;

const resolvePageTitle = ($: CheerioAPI, posting: JsonLdPosting | undefined, fallbackLink: string): string => {
    const heading = $('h1').text();
    if (heading) {
        return heading;
    }
    if (posting?.headline) {
        return posting.headline;
    }
    const docTitle = $('title').text();
    return docTitle || extractSlugFallback(fallbackLink);
};

const parseDetailPage = (html: string, entry: RssEntry): ParsedDetail => {
    const $ = load(html);
    const { bodyHtml, firstBodyImage, hasHeroImage } = cleanBodyHtml($, entry.link);
    if (!bodyHtml) {
        throw new Error(`Missing article body for ${entry.link}`);
    }
    const posting = extractJsonLdPosting($);
    const ogImage = parseHttpUrl($('meta[property="og:image"]').attr('content'), entry.link)?.href;
    const ldImage = extractLdImageUrl(posting, entry.link);
    const image = entry.rssImage ?? ogImage ?? ldImage ?? firstBodyImage;
    const coverToPrepend = !hasHeroImage && image && !bodyHtml.includes(image) ? image : undefined;

    return {
        title: entry.title || resolvePageTitle($, posting, entry.link),
        description: coverToPrepend ? renderDescription(bodyHtml, coverToPrepend) : bodyHtml,
        pubDateRaw: posting?.datePublished,
        author: extractLdAuthors(posting),
        category: extractCategories($),
        image,
    };
};

const buildFallbackDetail = (entry: RssEntry): ParsedDetail => {
    const excerptHtml = renderFallbackDescription(entry.excerpt) ?? '';
    return {
        title: entry.title || extractSlugFallback(entry.link),
        description: entry.rssImage ? renderDescription(excerptHtml, entry.rssImage) : excerptHtml || undefined,
        image: entry.rssImage,
    };
};

const fetchArticleDetail = async (entry: RssEntry): Promise<ParsedDetail> => {
    try {
        return await cache.tryGet<ParsedDetail>(`together:blog:${entry.link}`, async () => {
            const html = await ofetch(entry.link);
            return parseDetailPage(html, entry);
        });
    } catch {
        // Keep the feed healthy on transient single-article 404/timeout without caching degraded output.
        return buildFallbackDetail(entry);
    }
};

const handler = async (ctx: Context): Promise<Data> => {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const rssXml = await ofetch(RSS_URL, { responseType: 'text' });
    const entries = parseRssFeed(rssXml, limit);
    const details = await pMap(entries, (entry) => fetchArticleDetail(entry), { concurrency: DETAIL_CONCURRENCY });

    const items: DataItem[] = entries.map((entry, idx) => {
        const detail = details[idx];
        const pubDateSource = entry.pubDateRaw || detail.pubDateRaw;
        return {
            title: entry.title || detail.title || extractSlugFallback(entry.link),
            link: entry.link,
            pubDate: pubDateSource ? parseDate(pubDateSource) : undefined,
            author: detail.author,
            category: detail.category,
            description: detail.description,
            image: detail.image,
        };
    });

    return {
        title: 'Together AI Blog',
        link: BLOG_URL,
        description: 'Latest news, research, model releases, and inference engineering posts from Together AI.',
        language: 'en',
        item: items,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'together.ai/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    example: '/together/blog',
    parameters: {},
    maintainers: ['ljh12138164'],
    description:
        'Full-text news, research, model launches, and engineering posts from the official Together AI blog (`together.ai/blog`) via its RSS feed, preserving hero media, `<audio>` samples, `<video>` players, YouTube/Vimeo embeds, code blocks, and tables. Returns up to 20 articles by default and supports the common `limit` parameter.',
    zh: {
        name: '博客',
        description: '通过官方 RSS 抓取 Together AI 官方博客全文（涵盖新闻动态、前沿研究、模型发布与推理工程实践），完整保留题图、音视频播放器、YouTube/Vimeo 视频嵌入、代码块与表格。默认返回最新 20 篇，支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['www.together.ai/blog', 'www.together.ai/blog/:slug', 'www.together.ai/blog/rss.xml', 'together.ai/blog', 'together.ai/blog/:slug'],
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
    },
    handler,
};
