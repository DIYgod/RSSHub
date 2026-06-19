import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraNaverWebtoon } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildDetailUrl, mergeSeriesListResults, NAVER_LIST_URLS, parseDesktopSeriesListHtml, parseEpisodesFromRawHtml, parseMobileSeriesListHtml } from './naver-webtoon-list';
import { buildCacheKey } from './utils';

const MOBILE_HEADERS = {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.5',
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Referer: 'https://m.comic.naver.com/',
} as const;

const DESKTOP_HEADERS = {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.5',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Referer: 'https://comic.naver.com/',
} as const;

const EPISODE_PAGE_SIZE = 50;
const LIST_CACHE_TTL = 300;
const EPISODE_CACHE_TTL = 24 * 60 * 60;

interface DetailPageScrape {
    episodeHash: string | null;
    panelImageUrls: string[];
    totalPages: number;
}

function parseDetailPageHtml(html: string): DetailPageScrape {
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

    let episodeHash: string | null = null;
    if (ordered.length > 0) {
        const m = ordered[0].match(/\/([^/]+)_\d{3}\.(?:jpg|jpeg|png|webp)$/);
        episodeHash = m?.[1] ?? null;
    }

    return { episodeHash, panelImageUrls: ordered, totalPages: ordered.length };
}

async function fetchSeriesList(titleId: string) {
    const mobileUrl = NAVER_LIST_URLS.mobile(titleId);
    const desktopUrl = NAVER_LIST_URLS.desktop(titleId);

    const [mobileHtml, desktopHtml] = await Promise.all([
        cache.tryGet(
            buildCacheKey('naver-webtoon', 'list-mobile', titleId),
            () =>
                ofetch<string>(mobileUrl, {
                    headers: MOBILE_HEADERS,
                    parseResponse: (txt) => txt,
                }),
            LIST_CACHE_TTL
        ),
        cache.tryGet(
            buildCacheKey('naver-webtoon', 'list-desktop', titleId),
            () =>
                ofetch<string>(desktopUrl, {
                    headers: DESKTOP_HEADERS,
                    parseResponse: (txt) => txt,
                }),
            LIST_CACHE_TTL
        ),
    ]);

    const mobileParsed = parseMobileSeriesListHtml(mobileHtml, titleId);
    const desktopParsed = parseDesktopSeriesListHtml(desktopHtml, titleId);
    const regexParsed = parseEpisodesFromRawHtml(mobileHtml, titleId);

    const merged = mergeSeriesListResults(mobileParsed, desktopParsed, regexParsed);

    if (merged.episodes.length === 0) {
        const regexDesktop = parseEpisodesFromRawHtml(desktopHtml, titleId);
        return mergeSeriesListResults(merged, regexDesktop);
    }

    return merged;
}

export const route: Route = {
    path: '/naver/webtoon/:titleId',
    categories: ['multimedia'],
    example: '/spec/naver/webtoon/811721',
    parameters: {
        titleId: 'Naver Webtoon title ID — numeric. Found in the URL: comic.naver.com/webtoon/list?titleId=:titleId',
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
    name: 'Webtoon Episodes',
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
        throw new InvalidParameterError('Invalid Naver Webtoon title ID. Use the numeric titleId from comic.naver.com/webtoon/list?titleId=:titleId.');
    }

    const listUrl = NAVER_LIST_URLS.mobile(titleId);
    const { seriesTitle, seriesThumb, seriesFrontImage, seriesAuthor, seriesSummary, seriesScore, seriesRating, seriesDayOfWeek, episodes } = await fetchSeriesList(titleId);

    if (episodes.length === 0) {
        throw new InvalidParameterError(`No episodes found for Naver Webtoon title ID "${titleId}". Verify the series exists and is public (comic.naver.com/webtoon/list?titleId=${titleId}).`);
    }

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
                            headers: MOBILE_HEADERS,
                            parseResponse: (txt) => txt,
                        });
                        const scraped = parseDetailPageHtml(detailHtml);
                        panelImageUrls = scraped.panelImageUrls;
                        episodeHash = scraped.episodeHash;
                        totalPages = scraped.totalPages;
                    } catch {
                        // Paywalled or unavailable — list metadata still ships.
                    }

                    const link = `https://m.comic.naver.com/webtoon/detail?titleId=${titleId}&no=${ep.no}`;
                    const pubDate = parseDate(ep.dateStr, ['YY.MM.DD']);
                    const episodeThumb = ep.thumbnail;

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
                        seriesThumb,
                        seriesFrontImage,
                        seriesAuthor,
                        seriesSummary,
                        seriesScore,
                        seriesRating,
                        seriesDayOfWeek,
                        thumbnail: episodeThumb,
                    };

                    return {
                        title: ep.title,
                        link,
                        guid: `spec-naver-webtoon-${titleId}-${ep.no}`,
                        pubDate,
                        author: seriesTitle,
                        image: episodeThumb,
                        description: panelImageUrls.length ? `<img src="${panelImageUrls[0]}" />` : episodeThumb ? `<img src="${episodeThumb}" />` : '',
                        _extra: {
                            ...extra,
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
