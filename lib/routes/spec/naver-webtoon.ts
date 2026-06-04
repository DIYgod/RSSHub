import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraNaverWebtoon } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const NAVER_WEBTOON_MOBILE = 'https://m.comic.naver.com';

const HEADERS = {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.5',
    // RSSHub's built-in realistic UA — see AGENTS.md review guideline 36.
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Referer: 'https://m.comic.naver.com/',
} as const;

const EPISODE_PAGE_SIZE = 50;
const LIST_CACHE_TTL = 300; // 5 min — episode list flips often
const EPISODE_CACHE_TTL = 24 * 60 * 60; // 24h — episode pages stable

interface ParsedEpisodeRow {
    no: string;
    title: string;
    dateStr: string;
    isFree: boolean;
    thumbnail?: string;
    detailPath: string; // e.g. "/webtoon/detail?titleId=811721&no=237"
}

function buildDetailUrl(detailPath: string): string {
    return detailPath.startsWith('http') ? detailPath : `${NAVER_WEBTOON_MOBILE}${detailPath}`;
}

/**
 * Parse the mobile series list page (m.comic.naver.com/webtoon/list?titleId=...)
 * into a stable per-episode metadata shape. The list page renders server-side
 * with class names like `strong.title`, `span.date` (verified Apr 2026 against
 * `?titleId=811721`); we lean on structural selectors + the `no=` query param
 * for the canonical episode key.
 */
function parseSeriesListHtml(html: string, titleId: string): { seriesTitle: string; episodes: ParsedEpisodeRow[] } {
    const $ = load(html);
    // Series title lives in a single `<strong class="title">…</strong>` on the
    // mobile list page. The page's global nav uses `<h1 class="header_gnb">`
    // (verified Apr 2026 against titleId=811721) — picking the first <h1>
    // there returns the wrong text. `og:title` is a stable fallback.
    const seriesTitle = $('strong.title').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || `Naver Webtoon ${titleId}`;

    const seen = new Set<string>();
    const episodes: ParsedEpisodeRow[] = [];

    // Walk every anchor that points at a detail page for this series and lift
    // out the sibling title/date nodes. This is robust against CSS Module hash
    // suffixes that Naver ships (the anchor href itself is stable).
    $('a[href*="webtoon/detail"][href*="titleId="]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        if (!href) {
            return;
        }

        let no = '';
        try {
            const url = new URL(href, NAVER_WEBTOON_MOBILE);
            if (url.searchParams.get('titleId') !== titleId) {
                return;
            }
            no = url.searchParams.get('no') ?? '';
        } catch {
            return;
        }
        if (!/^\d+$/.test(no) || seen.has(no)) {
            return;
        }
        seen.add(no);

        const title = $el.find('strong.title, span.title, .title').first().text().trim() || `제${no}화`;
        const dateStr = $el.find('span.date, .date').first().text().trim();
        const isFree = $el.find('.ico_free, [class*="free"]').length > 0;
        const thumb = $el.find('img[src*="comic.naver.com"], img[src*="pstatic.net"]').first().attr('src');

        episodes.push({
            no,
            title,
            dateStr,
            isFree,
            thumbnail: thumb || undefined,
            detailPath: href.startsWith('http') ? new URL(href).pathname + new URL(href).search : href,
        });
    });

    // Newest-first (Naver's mobile list renders newest at the top; the anchor
    // walk preserves document order, so this is a no-op for the typical page —
    // kept explicit so the contract is obvious to the next reader.)
    return { seriesTitle, episodes };
}

interface DetailPageScrape {
    /** Episode hash extracted from the first image URL path, e.g. `9103dfa76f271dc9ec81409e7dfec601`. */
    episodeHash: string | null;
    /** Ordered panel image URLs scraped from the mobile viewer page. */
    panelImageUrls: string[];
    totalPages: number;
}

function parseDetailPageHtml(html: string): DetailPageScrape {
    // The mobile viewer page embeds every panel image URL in script data and
    // <noscript> fallbacks. We don't depend on `.wt_viewer img[id]` (which the
    // OCR worker also documents as fragile) — we scan the raw HTML for the
    // canonical panel URL pattern and de-dupe while preserving order.
    //
    // Real panels follow: /mobilewebimg/{titleId}/{no}/{hash}_{NNN}.{ext}
    // where NNN is exactly 3 zero-padded digits (001, 002, …). The page also
    // includes unrelated recommendation thumbnails (different path layout:
    // /webtoon/{titleId}/thumbnail/...) which we must exclude.
    const panelUrlRegex = /https:\/\/image-comic\.pstatic\.net\/mobilewebimg\/[^\s"'<>)]+_\d{3}\.(?:jpg|jpeg|png|webp)/g;
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const match of html.match(panelUrlRegex) ?? []) {
        if (seen.has(match)) {
            continue;
        }
        seen.add(match);
        ordered.push(match);
    }

    // Derive the episode hash from the first URL: .../{titleId}/{no}/{hash}_NNN.jpg
    let episodeHash: string | null = null;
    if (ordered.length > 0) {
        const m = ordered[0].match(/\/([^/]+)_\d{3}\.(?:jpg|jpeg|png|webp)$/);
        episodeHash = m?.[1] ?? null;
    }

    return { episodeHash, panelImageUrls: ordered, totalPages: ordered.length };
}

export const route: Route = {
    path: '/naver/webtoon/:titleId',
    categories: ['multimedia'],
    example: '/spec/naver/webtoon/811721',
    parameters: {
        titleId: 'Naver Webtoon title ID — numeric. Found in the URL: m.comic.naver.com/webtoon/list?titleId=:titleId',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'comic.naver.com',
    name: 'Webtoon Episodes (Mobile)',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['m.comic.naver.com/webtoon/list?titleId=:titleId', 'comic.naver.com/webtoon/list?titleId=:titleId'],
            target: '/spec/naver/webtoon/:titleId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const titleId = ctx.req.param('titleId');

    if (!titleId || !/^\d+$/.test(titleId)) {
        throw new InvalidParameterError('Invalid Naver Webtoon title ID. Use the numeric titleId from m.comic.naver.com/webtoon/list?titleId=:titleId.');
    }

    const listUrl = `${NAVER_WEBTOON_MOBILE}/webtoon/list?titleId=${titleId}`;

    // ── 1. Series metadata + episode list (short-TTL) ─────────────────────
    const listHtml = await cache.tryGet(buildCacheKey('naver-webtoon', 'list', titleId), () => ofetch<string>(listUrl, { headers: HEADERS, parseResponse: (txt) => txt }), LIST_CACHE_TTL);

    const { seriesTitle, episodes } = parseSeriesListHtml(listHtml, titleId);

    if (episodes.length === 0) {
        throw new InvalidParameterError(`No episodes found for Naver Webtoon title ID "${titleId}". Verify the series exists and is public (m.comic.naver.com/webtoon/list?titleId=${titleId}).`);
    }

    // ── 2. Newest N episodes — per-episode detail scrape for image URLs ──
    const recent = episodes.slice(0, EPISODE_PAGE_SIZE);

    const items: DataItem[] = await Promise.all(
        recent.map((ep) =>
            cache.tryGet(
                buildCacheKey('naver-webtoon', 'ep', titleId, ep.no),
                async () => {
                    const detailUrl = buildDetailUrl(ep.detailPath);

                    let panelImageUrls: string[] = [];
                    let episodeHash: string | null = null;
                    let totalPages = 0;
                    try {
                        const detailHtml = await ofetch<string>(detailUrl, {
                            headers: HEADERS,
                            parseResponse: (txt) => txt,
                        });
                        const scraped = parseDetailPageHtml(detailHtml);
                        panelImageUrls = scraped.panelImageUrls;
                        episodeHash = scraped.episodeHash;
                        totalPages = scraped.totalPages;
                    } catch {
                        // Episode page is paywalled or temporarily unavailable.
                        // We still emit the item with whatever metadata we
                        // already have from the list page so the user sees
                        // the episode; `panelImageUrls` stays empty and the
                        // downstream OCR job will mark `ocr_pending` stuck.
                    }

                    const link = `https://m.comic.naver.com/webtoon/detail?titleId=${titleId}&no=${ep.no}`;
                    const pubDate = parseDate(ep.dateStr, ['YY.MM.DD']);

                    const extra: SpecExtraNaverWebtoon = {
                        type: 'naver/webtoon/episode',
                        platform: 'naver-webtoon',
                        sourceUrl: link,
                        externalId: ep.no,
                        seriesExternalId: titleId,
                        episodeLabel: `EP ${ep.no}`,
                        publishedAt: pubDate ? pubDate.toISOString() : undefined,
                        titleId,
                        episodeNumber: Number(ep.no),
                        panelImageUrls,
                    };

                    return {
                        title: ep.title,
                        link,
                        guid: `spec-naver-webtoon-${titleId}-${ep.no}`,
                        pubDate,
                        author: seriesTitle,
                        image: ep.thumbnail,
                        description: panelImageUrls.length ? `<img src="${panelImageUrls[0]}" />` : ep.thumbnail ? `<img src="${ep.thumbnail}" />` : '',
                        // Episode hash + total pages flow through `_extra` so
                        // the downstream OCR worker can reuse them instead of
                        // re-scraping the detail page.
                        _extra: {
                            ...extra,
                            // @ts-expect-error — `episodeHash` / `totalPages`
                            // are not on the public SpecExtra shape; they're
                            // carried under `platform_data`-style passthrough.
                            episodeHash,
                            totalPages,
                        } as SpecExtraNaverWebtoon,
                    } satisfies DataItem;
                },
                EPISODE_CACHE_TTL
            )
        )
    );

    return {
        title: `${seriesTitle} — Naver Webtoon`,
        link: listUrl,
        item: items,
        language: 'ko',
    };
}
