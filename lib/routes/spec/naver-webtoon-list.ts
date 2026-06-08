import { load } from 'cheerio';

const NAVER_WEBTOON_DESKTOP = 'https://comic.naver.com';
const NAVER_WEBTOON_MOBILE = 'https://m.comic.naver.com';

export interface ParsedEpisodeRow {
    no: string;
    title: string;
    dateStr: string;
    isFree: boolean;
    thumbnail?: string;
    detailPath: string;
}

export interface ParsedSeriesList {
    seriesTitle: string;
    /** Desktop list poster (`Poster__image` / og:image) — card background. */
    seriesThumb?: string;
    /** Mobile transparent PNG from `.area_thumbnail img[src*="frontImage"]`. */
    seriesFrontImage?: string;
    seriesAuthor?: string;
    /** Long synopsis from `info_back`; short tagline from `area_info` as fallback. */
    seriesSummary?: string;
    /** Star score from mobile `.area_info .score`, e.g. "9.82". */
    seriesScore?: string;
    /** Age rating label, e.g. "15세 이용가". */
    seriesRating?: string;
    /** Weekday label, e.g. "일요웹툰". */
    seriesDayOfWeek?: string;
    /** Genre labels joined from `info_back .genre`. */
    seriesGenre?: string;
    episodes: ParsedEpisodeRow[];
    /** Where the episode list was parsed from. */
    source: 'mobile' | 'desktop' | 'regex';
}

export function absolutizeNaverImageUrl(src: string | undefined): string | undefined {
    if (!src?.trim()) {
        return undefined;
    }
    const trimmed = src.trim();
    if (trimmed.startsWith('http')) {
        return trimmed;
    }
    if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
    }
    return trimmed;
}

function extractBackgroundImageUrl(style: string | undefined): string | undefined {
    if (!style) {
        return undefined;
    }
    const match = style.match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/i);
    return match ? absolutizeNaverImageUrl(match[2]) : undefined;
}

/** Desktop list poster — never the mobile `frontImage` decorative PNG. */
export function pickDesktopPosterImage($: ReturnType<typeof load>, titleId: string): string | undefined {
    const fromPosterClass = absolutizeNaverImageUrl($('img[class*="Poster__image"], img[class*="poster"], img.Poster__image--d9XTI').first().attr('src'));
    if (fromPosterClass && !fromPosterClass.includes('frontImage_')) {
        return fromPosterClass;
    }

    const fromImg = absolutizeNaverImageUrl($(`img[src*="/webtoon/${titleId}/thumbnail/thumbnail"]:not([src*="frontImage"]), img[src*="/thumb/webtoon/${titleId}/thumbnail/thumbnail"]:not([src*="frontImage"])`).first().attr('src'));
    if (fromImg) {
        return fromImg;
    }

    const html = $.html();
    const posterMatch = html.match(new RegExp(`https://(?:image-comic|shared-comic)\\.pstatic\\.net/(?:webtoon|thumb/webtoon)/${titleId}/thumbnail/thumbnail_[^"'\\s)]+`, 'i'));
    return posterMatch?.[0] ?? undefined;
}

function pickSeriesThumb($: ReturnType<typeof load>, titleId: string): string | undefined {
    const fromDesktopPoster = pickDesktopPosterImage($, titleId);
    if (fromDesktopPoster) {
        return fromDesktopPoster;
    }

    const fromMeta = absolutizeNaverImageUrl($('meta[property="og:image"]').attr('content'));
    if (fromMeta && !fromMeta.includes('frontImage_')) {
        return fromMeta;
    }

    return undefined;
}

/** Mobile `.section_toon_info` block — rich metadata + transparent frontImage. */
export function parseMobileSectionToonInfo(
    $: ReturnType<typeof load>
): Pick<ParsedSeriesList, 'seriesTitle' | 'seriesFrontImage' | 'seriesAuthor' | 'seriesSummary' | 'seriesScore' | 'seriesRating' | 'seriesDayOfWeek' | 'seriesGenre'> {
    const $section = $('.section_toon_info');
    if ($section.length === 0) {
        return {};
    }

    const seriesFrontImage = absolutizeNaverImageUrl($section.find('.area_thumbnail img[src*="frontImage"]').first().attr('src'));

    const tagline = $section.find('.area_info .summary').first().text().replaceAll(/\s+/g, ' ').trim();
    const toonTitle = $section.find('.area_info strong.title').first().text().replaceAll(/\s+/g, ' ').trim();
    const author = $section.find('.area_info .author').first().text().replaceAll(/\s+/g, ' ').trim();
    const seriesScore = $section.find('.area_info .score').first().text().replaceAll(/\s+/g, ' ').trim();

    const longSummary = $section.find('.info_back .summary p').first().text().replaceAll(/\s+/g, ' ').trim();

    const genres: string[] = [];
    $section.find('.info_back .genre li').each((_, el) => {
        const label = $(el).text().replaceAll(/\s+/g, ' ').trim();
        if (label && !genres.includes(label)) {
            genres.push(label);
        }
    });

    const weekdayRaw = $section.find('.info_back .week_day .list_detail li').first().text().replaceAll(/\s+/g, ' ').trim();
    const seriesDayOfWeek = weekdayRaw ? `${weekdayRaw}요웹툰`.replace(/요요웹툰$/, '요웹툰') : undefined;

    const seriesRating = $section.find('.info_back .week_day .age li, .info_back .property.age li').first().text().replaceAll(/\s+/g, ' ').trim() || undefined;

    return {
        seriesTitle: toonTitle || undefined,
        seriesFrontImage,
        seriesAuthor: author || undefined,
        seriesSummary: longSummary || tagline || undefined,
        seriesScore: seriesScore || undefined,
        seriesRating,
        seriesDayOfWeek,
        seriesGenre: genres.length > 0 ? genres.join(', ') : undefined,
    };
}

/** Author, summary, age rating, and weekday from list-page detail block. */
export function parseSeriesMetadata($: ReturnType<typeof load>): Pick<ParsedSeriesList, 'seriesAuthor' | 'seriesSummary' | 'seriesRating' | 'seriesDayOfWeek'> {
    const authors: string[] = [];
    $('.detail .author_list .author .ellipsis, .detail .author_list span.author .ellipsis').each((_, el) => {
        const name = $(el).text().replaceAll(/\s+/g, ' ').trim();
        if (name && !authors.includes(name)) {
            authors.push(name);
        }
    });

    const summary = $('.summary p').first().text().replaceAll(/\s+/g, ' ').trim() || $('[class*="EpisodeListInfo"] [class*="summary"]').first().text().replaceAll(/\s+/g, ' ').trim() || undefined;

    const rating = $(".property.list_detail.age li, .age li, [class*='age'] li").first().text().replaceAll(/\s+/g, ' ').trim() || undefined;

    const weekdayRaw = $('.detail .week_day .list_detail li, dl.detail .week_day li').first().text().replaceAll(/\s+/g, ' ').trim() || undefined;
    const seriesDayOfWeek = weekdayRaw ? (weekdayRaw.includes('웹툰') ? weekdayRaw : `${weekdayRaw}요웹툰`) : undefined;

    return {
        seriesAuthor: authors.length > 0 ? authors.join(' / ') : undefined,
        seriesSummary: summary,
        seriesRating: rating,
        seriesDayOfWeek,
    };
}

function pickEpisodeThumb($: ReturnType<typeof load>, $el: ReturnType<ReturnType<typeof load>>, titleId: string, no: string): string | undefined {
    const fromImg = absolutizeNaverImageUrl($el.find(`img[src*="/webtoon/${titleId}/${no}/thumbnail"]`).first().attr('src') || $el.find('img[src*="thumbnail_202x120"]').first().attr('src'));
    if (fromImg) {
        return fromImg;
    }

    let bgMatch: string | undefined;
    $el.find('[style*="background-image"]').each((_, node) => {
        const bg = extractBackgroundImageUrl($(node).attr('style'));
        if (bg?.includes(`/webtoon/${titleId}/${no}/`)) {
            bgMatch = bg;
            return false;
        }
    });
    if (bgMatch) {
        return bgMatch;
    }

    const selfBg = extractBackgroundImageUrl($el.attr('style'));
    if (selfBg?.includes(`/webtoon/${titleId}/${no}/`)) {
        return selfBg;
    }

    $el.find(".thumb, [class*='thumb']").each((_, node) => {
        const bg = extractBackgroundImageUrl($(node).attr('style'));
        if (bg?.includes(`/webtoon/${titleId}/`)) {
            bgMatch = bg;
            return false;
        }
    });

    return bgMatch;
}

/** Episode title from list row — excludes `.bullet` badge text (up/new/…). */
export function extractEpisodeListTitle($: ReturnType<typeof load>, $el: ReturnType<ReturnType<typeof load>>, no: string): string {
    const fromName = $el.find('.title .name, .title span.name, strong.title .name').first().text().replaceAll(/\s+/g, ' ').trim();
    if (fromName) {
        return fromName;
    }

    const fromAlt = $el.find('img[alt]').first().attr('alt')?.trim();
    if (fromAlt) {
        return fromAlt.replaceAll(/\s+/g, ' ').trim();
    }

    const $title = $el.find('strong.title, .title').first().clone();
    $title.find(".bullet, [class*='bullet'], .blind").remove();
    const text = $title.text().replaceAll(/\s+/g, ' ').trim();
    return text || `제${no}화`;
}

/**
 * Mobile list page (m.comic.naver.com) — server-rendered HTML with episode rows.
 */
export function parseMobileSeriesListHtml(html: string, titleId: string): ParsedSeriesList {
    const $ = load(html);
    const toonInfo = parseMobileSectionToonInfo($);
    const seriesTitle = toonInfo.seriesTitle || $('strong.title').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim() || `Naver Webtoon ${titleId}`;

    const seriesThumb = pickSeriesThumb($, titleId);
    const meta = parseSeriesMetadata($);
    const seen = new Set<string>();
    const episodes: ParsedEpisodeRow[] = [];

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

        const title = extractEpisodeListTitle($, $el, no);
        const dateStr = $el.find('span.date, .date').first().text().trim() || $el.closest('li, tr, div').find('span.date').first().text().trim();
        const isFree = $el.find('.ico_free, [class*="free"]').length > 0;
        const thumbnail = pickEpisodeThumb($, $el, titleId, no);

        episodes.push({
            no,
            title,
            dateStr,
            isFree,
            thumbnail,
            detailPath: href.startsWith('http') ? new URL(href).pathname + new URL(href).search : href,
        });
    });

    return {
        seriesTitle,
        seriesThumb,
        ...meta,
        ...toonInfo,
        episodes,
        source: 'mobile',
    };
}

/**
 * Desktop list page — often a client-rendered shell with no episode anchors.
 * Still useful for og:title / Poster__image when mobile meta is sparse.
 */
export function parseDesktopSeriesListHtml(html: string, titleId: string): ParsedSeriesList {
    const $ = load(html);
    const seriesTitle = $('meta[property="og:title"]').attr('content')?.trim() || $('[class*="EpisodeListHeading"]').first().text().trim() || `Naver Webtoon ${titleId}`;

    const seriesThumb = pickDesktopPosterImage($, titleId) ?? pickSeriesThumb($, titleId);
    const meta = parseSeriesMetadata($);
    const seen = new Set<string>();
    const episodes: ParsedEpisodeRow[] = [];

    $('a[href*="webtoon/detail"][href*="titleId="]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        if (!href) {
            return;
        }

        let no = '';
        try {
            const url = new URL(href, NAVER_WEBTOON_DESKTOP);
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

        const title = extractEpisodeListTitle($, $el, no);
        const dateStr = $el.find('[class*="EpisodeListList__date"], span.date, .date').first().text().trim();
        const isFree = $el.find('.ico_free, [class*="free"]').length > 0;
        const thumbnail = pickEpisodeThumb($, $el, titleId, no);

        episodes.push({
            no,
            title,
            dateStr,
            isFree,
            thumbnail,
            detailPath: href.startsWith('http') ? new URL(href).pathname + new URL(href).search : href,
        });
    });

    return { seriesTitle, seriesThumb, ...meta, episodes, source: 'desktop' };
}

/**
 * Last-resort scan when cheerio selectors miss (partial HTML, layout drift).
 */
export function parseEpisodesFromRawHtml(html: string, titleId: string): ParsedSeriesList {
    const seriesTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1]?.trim() || `Naver Webtoon ${titleId}`;

    const seriesThumb =
        absolutizeNaverImageUrl(html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1]) ||
        html.match(new RegExp(`https://(?:image-comic|shared-comic)\\.pstatic\\.net/(?:webtoon|thumb/webtoon)/${titleId}/thumbnail/thumbnail_[^"'\\s)]+`, 'i'))?.[0];

    const meta = parseSeriesMetadata(load(html));

    const linkRegex = new RegExp(`/webtoon/detail\\?titleId=${titleId}&no=(\\d+)[^"'\\s]*`, 'gi');
    const thumbRegex = new RegExp(`https://image-comic\\.pstatic\\.net/webtoon/${titleId}/(\\d+)/thumbnail_202x120_[^"'\\s)]+`, 'gi');

    const thumbsByNo = new Map<string, string>();
    for (const match of html.match(thumbRegex) ?? []) {
        const noMatch = match.match(new RegExp(`/webtoon/${titleId}/(\\d+)/`));
        if (noMatch?.[1]) {
            thumbsByNo.set(noMatch[1], match);
        }
    }

    const seen = new Set<string>();
    const episodes: ParsedEpisodeRow[] = [];

    for (const match of html.matchAll(linkRegex)) {
        const no = match[1];
        if (seen.has(no)) {
            continue;
        }
        seen.add(no);
        const detailPath = match[0].startsWith('http') ? match[0] : match[0];
        episodes.push({
            no,
            title: `제${no}화`,
            dateStr: '',
            isFree: false,
            thumbnail: thumbsByNo.get(no),
            detailPath: detailPath.startsWith('/') ? detailPath : `/${detailPath}`,
        });
    }

    return { seriesTitle, seriesThumb, ...meta, episodes, source: 'regex' };
}

/** Merge desktop meta with the first non-empty episode list. */
export function mergeSeriesListResults(...candidates: ParsedSeriesList[]): ParsedSeriesList {
    const withEpisodes = candidates.find((c) => c.episodes.length > 0);
    if (!withEpisodes) {
        return (
            candidates[0] ?? {
                seriesTitle: 'Naver Webtoon',
                episodes: [],
                source: 'mobile',
            }
        );
    }

    const meta = candidates.find((c) => c.seriesThumb && !c.seriesTitle.startsWith('Naver Webtoon ')) ?? withEpisodes;

    const metaFields: Pick<ParsedSeriesList, 'seriesAuthor' | 'seriesSummary' | 'seriesScore' | 'seriesRating' | 'seriesDayOfWeek' | 'seriesGenre' | 'seriesFrontImage'> = {};
    for (const c of candidates) {
        metaFields.seriesAuthor ??= c.seriesAuthor;
        metaFields.seriesSummary ??= c.seriesSummary;
        metaFields.seriesScore ??= c.seriesScore;
        metaFields.seriesRating ??= c.seriesRating;
        metaFields.seriesDayOfWeek ??= c.seriesDayOfWeek;
        metaFields.seriesGenre ??= c.seriesGenre;
        metaFields.seriesFrontImage ??= c.seriesFrontImage;
    }

    const desktopPoster = candidates.find((c) => c.source === 'desktop')?.seriesThumb ?? candidates.find((c) => c.seriesThumb && !c.seriesThumb.includes('frontImage_') && /\/thumbnail\/thumbnail/i.test(c.seriesThumb))?.seriesThumb;

    return {
        seriesTitle: meta.seriesTitle || withEpisodes.seriesTitle,
        seriesThumb: desktopPoster ?? meta.seriesThumb ?? withEpisodes.seriesThumb,
        ...metaFields,
        episodes: withEpisodes.episodes,
        source: withEpisodes.source,
    };
}

export function buildDetailUrl(detailPath: string): string {
    return detailPath.startsWith('http') ? detailPath : `${NAVER_WEBTOON_MOBILE}${detailPath}`;
}

export const NAVER_LIST_URLS = {
    mobile: (titleId: string) => `${NAVER_WEBTOON_MOBILE}/webtoon/list?titleId=${titleId}`,
    desktop: (titleId: string) => `${NAVER_WEBTOON_DESKTOP}/webtoon/list?titleId=${titleId}`,
} as const;
