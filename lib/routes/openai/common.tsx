import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { renderMediaFallbackDescription } from './templates/description';

export const BASE_URL = new URL('https://openai.com');

const parseSafeHttpUrl = (rawUrl: string | undefined, baseUrl?: string): string | undefined => {
    if (!rawUrl) {
        return undefined;
    }
    try {
        const parsed = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return undefined;
        }
        return parsed.href;
    } catch {
        return undefined;
    }
};

const isHostMatch = (host: string, domain: string): boolean => host === domain || host.endsWith(`.${domain}`);

const isAllowedVideoPath = (host: string, parsed: URL): boolean => {
    if (isHostMatch(host, 'vimeo.com')) {
        return parsed.pathname.startsWith('/video/');
    }
    if (isHostMatch(host, 'youtube.com') || isHostMatch(host, 'youtube-nocookie.com')) {
        return parsed.pathname.startsWith('/embed/') || (parsed.pathname === '/watch' && parsed.searchParams.has('v'));
    }
    if (host === 'youtu.be') {
        return parsed.pathname.length > 1;
    }
    return false;
};

const parseAllowedVideoUrl = (rawUrl: string): string | undefined => {
    const cleaned = rawUrl
        .replaceAll('&amp;', '&')
        .replaceAll(String.raw`\u0026`, '&')
        .replace(/[),.\];}]+$/, '');
    const safeUrl = parseSafeHttpUrl(cleaned);
    if (!safeUrl) {
        return undefined;
    }
    const parsed = new URL(safeUrl);
    return isAllowedVideoPath(parsed.hostname.toLowerCase(), parsed) ? parsed.href : undefined;
};

const extractDomVideoUrl = ($: CheerioAPI, $article: Cheerio<Element>): string | undefined => {
    for (const el of $article.find('iframe[src], video[src], video source[src]').toArray()) {
        const valid = parseAllowedVideoUrl($(el).attr('src') ?? '');
        if (valid) {
            return valid;
        }
    }
    return undefined;
};

const extractVideoUrl = ($: CheerioAPI, $article: Cheerio<Element>, html: string): string | undefined => {
    const domUrl = extractDomVideoUrl($, $article);
    if (domUrl) {
        return domUrl;
    }
    for (const match of html.matchAll(/\\?"videoEmbedUrl\\?"\s*:\s*\\?"(https?:\/\/[^"\\]+(?:\\u0026[^"\\]*)*)/gi)) {
        const valid = parseAllowedVideoUrl(match[1]);
        if (valid) {
            return valid;
        }
    }
    return undefined;
};

const hasReadableBody = ($article: Cheerio<Element>): boolean => {
    if ($article.length === 0) {
        return false;
    }
    return Boolean($article.text().trim()) || $article.find('img, video, audio, iframe, table, pre, blockquote').length > 0;
};

const stripEmptyDivs = ($: CheerioAPI, $article: Cheerio<Element>) => {
    for (const el of $article.find('div').toArray().toReversed()) {
        const $el = $(el);
        const hasText = Boolean($el.text().replaceAll('\u{A0}', '').trim());
        if (!hasText && $el.find('img, video, audio, iframe, table, pre, blockquote, a[href]').length === 0) {
            $el.remove();
        }
    }
};

const cleanArticleDom = ($: CheerioAPI, $article: Cheerio<Element>) => {
    // Remove action chrome (Share button, read-aloud player, mobile sticky TOC) before evaluating body content.
    $article.find('[data-article-hero-actions], [data-read-aloud-ui], nav[data-show-toc], script, style, noscript, template').remove();

    // Article header (title, sub title and categories); guard against detaching an ancestor above $article.
    const articleNode = $article.get(0);
    const heroHeader = $article.find('h1').parents().get(4);
    if (articleNode && heroHeader && $.contains(articleNode, heroHeader)) {
        $(heroHeader).remove();
    }
    $article.find('h1, [data-article-hero-copy-region]').remove();

    // Remove the trailing "Keep reading" shelf without dropping footnotes or standalone video containers.
    $article
        .children()
        .filter((_, el) => $(el).find('h2').first().text().trim() === 'Keep reading')
        .remove();

    // Article authors and citations
    $article.find('#citations, [data-testid="author-list"]').remove();
    stripEmptyDivs($, $article);
};

/** Fetch the details of an article. */
const fetchArticleDetails = async (url: string, title: string, rssDescription?: string) => {
    // Ensure trailing slash to avoid 301 redirect
    const articleUrl = new URL(url);
    if (!articleUrl.pathname.endsWith('/')) {
        articleUrl.pathname += '/';
    }
    const normalizedUrl = articleUrl.href;
    const html = await ofetch(normalizedUrl, {
        // OpenAI article pages return Cloudflare 403 challenges when Undici negotiates HTTP/2.
        allowH2: false,
    });
    const $ = load(html);

    const $article = $('#main article');

    const categories = $('h1')
        .prev()
        .find('a[href]')
        .toArray()
        .map((element) => $(element).text());

    const authors = $('[data-testid="author-list"] a')
        .toArray()
        .map((element) => $(element).text());

    const image = parseSafeHttpUrl($('meta[property="og:image"]').attr('content'), normalizedUrl);
    const subhead = $('[data-article-hero-copy-region="subhead"]').first().text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim();

    cleanArticleDom($, $article);

    const content = hasReadableBody($article) ? $article.html() : renderMediaFallbackDescription(subhead || rssDescription || metaDescription, normalizedUrl, title, image, extractVideoUrl($, $article, html));

    return {
        content,
        // Categories can be found on https://openai.com/news/ and https://openai.com/research/index/
        categories,
        image,
        author: authors.join(', '),
        link: normalizedUrl,
    };
};

/** Fetch all articles from OpenAI's RSS feed. */
export const fetchArticles = async (limit: number, category?: string): Promise<DataItem[]> => {
    const page = await ofetch('https://openai.com/news/rss.xml', {
        responseType: 'text',
        headers: { 'User-Agent': config.ua },
    });

    const $ = load(page, { xml: true });

    let items = $('item').toArray();
    if (category) {
        items = items.filter((element) => $(element).find('category').text() === category);
    }

    return pMap(
        items.slice(0, limit),
        async (element): Promise<DataItem> => {
            const id = $(element).find('guid').text();
            const title = $(element).find('title').text();
            const rssDescription = $(element).find('description').text().trim();
            const pubDate = parseDate($(element).find('pubDate').text());
            const link = $(element).find('link').text();
            const { content, categories, author, link: articleLink } = await cache.tryGet(`openai:news:detail:v3:${id}`, () => fetchArticleDetails(link, title, rssDescription));

            return {
                guid: id,
                title,
                link: articleLink,
                pubDate,
                description: content,
                category: categories,
                author,
            };
        },
        { concurrency: 3 }
    );
};
