import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const CACHE_KEY = 'twitter:gql-query-ids';
const CACHE_TTL = 86400; // 24 hours

// Hardcoded fallback IDs (last known working values)
export const fallbackIds: Record<string, string> = {
    UserTweets: 'E3opETHurmVJflFsUBVuUQ',
    UserByScreenName: 'Yka-W8dz7RaEuQNkroPkYw',
    HomeTimeline: 'xhYBF94fPSp8ey64FfYXiA',
    HomeLatestTimeline: '0vp2Au9doTKsbn2vIk48Dg',
    UserTweetsAndReplies: 'bt4TKuFz4T7Ckk-VvQVSow',
    UserMedia: 'dexO_2tohK86JDudXXG3Yw',
    UserByRestId: 'Qw77dDjp9xCpUY-AXwt-yQ',
    SearchTimeline: 'UN1i3zUiCWa-6r-Uaho4fw',
    ListLatestTweetsTimeline: 'Pa45JvqZuKcW1plybfgBlQ',
    TweetDetail: 'QuBlQ6SxNAQCt6-kBiCXCQ',
};

const operationNames = Object.keys(fallbackIds);

async function fetchTwitterPage(): Promise<string> {
    const response = await ofetch('https://x.com', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
        parseResponse: (txt) => txt,
    });
    return response as unknown as string;
}

function extractScriptUrls(html: string): string[] {
    const urls: string[] = [];

    // Extract main.xxx.js URL
    const mainMatch = html.match(/\/client-web\/main\.([a-z0-9]+)\./);
    if (mainMatch) {
        urls.push(`https://abs.twimg.com/responsive-web/client-web/main.${mainMatch[1]}.js`);
    }

    // Extract other script bundle URLs from the chunk map
    // Twitter embeds a JSON map like: e=>e+"."+{"chunk1":"hash1","chunk2":"hash2"}[e]+"a.js"
    const chunkMatch = html.match(/e=>e\+"\."[+](.+?)\[e\][+]"a\.js"/);
    if (chunkMatch) {
        try {
            const chunks = JSON.parse(chunkMatch[1]);
            for (const [key, value] of Object.entries(chunks)) {
                const url = `https://abs.twimg.com/responsive-web/client-web/${key}.${value}a.js`;
                // Skip i18n, icon, and syntax highlighter bundles
                if (!url.includes('/i18n/') && !url.includes('/icons/') && !url.includes('react-syntax-highlighter')) {
                    urls.push(url);
                }
            }
        } catch {
            logger.debug('twitter gql-id-resolver: failed to parse chunk map');
        }
    }

    return urls;
}

function extractQueryIds(scriptContent: string): Record<string, string> {
    const ids: Record<string, string> = {};
    // Match patterns like: queryId:"xhYBF94fPSp8ey64FfYXiA",operationName:"HomeTimeline"
    // Also handles: queryId:"xxx",...,operationName:"yyy" with other fields in between
    const matches = scriptContent.matchAll(/queryId:"([^"]+?)".+?operationName:"([^"]+?)"/g);
    for (const match of matches) {
        const [, queryId, operationName] = match;
        if (operationNames.includes(operationName)) {
            ids[operationName] = queryId;
        }
    }
    return ids;
}

async function fetchAndExtractIds(): Promise<Record<string, string>> {
    const html = await fetchTwitterPage();
    const scriptUrls = extractScriptUrls(html);

    if (scriptUrls.length === 0) {
        logger.warn('twitter gql-id-resolver: no script URLs found in Twitter page');
        return {};
    }

    logger.debug(`twitter gql-id-resolver: found ${scriptUrls.length} script URLs`);

    const results = await Promise.allSettled(
        scriptUrls.map(async (url) => {
            const content = await ofetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
                },
                parseResponse: (txt) => txt,
            });
            return extractQueryIds(content as unknown as string);
        })
    );

    const allIds: Record<string, string> = {};
    for (const result of results) {
        if (result.status === 'fulfilled') {
            Object.assign(allIds, result.value);
        }
    }

    return allIds;
}

let resolvePromise: Promise<Record<string, string>> | null = null;

export async function resolveQueryIds(): Promise<Record<string, string>> {
    // Check cache first
    const cached = await cache.get(CACHE_KEY);
    if (cached) {
        try {
            const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                logger.debug(`twitter gql-id-resolver: using cached query IDs`);
                return { ...fallbackIds, ...parsed };
            }
        } catch {
            // ignore parse error
        }
    }

    // Deduplicate concurrent requests
    if (!resolvePromise) {
        resolvePromise = (async () => {
            try {
                logger.info('twitter gql-id-resolver: fetching fresh query IDs from Twitter JS bundles');
                const ids = await fetchAndExtractIds();

                if (Object.keys(ids).length > 0) {
                    await cache.set(CACHE_KEY, JSON.stringify(ids), CACHE_TTL);
                    const found = operationNames.filter((name) => ids[name]);
                    const missing = operationNames.filter((name) => !ids[name]);
                    logger.info(`twitter gql-id-resolver: resolved ${found.length}/${operationNames.length} query IDs. Missing: ${missing.join(', ') || 'none'}`);
                } else {
                    logger.warn('twitter gql-id-resolver: failed to extract any query IDs, using fallback');
                }

                return ids;
            } catch (error) {
                logger.warn(`twitter gql-id-resolver: error fetching query IDs: ${error}. Using fallback.`);
                return {};
            } finally {
                resolvePromise = null;
            }
        })();
    }

    const ids = await resolvePromise;
    return { ...fallbackIds, ...ids };
}

export function buildGqlMap(queryIds: Record<string, string>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const name of operationNames) {
        const id = queryIds[name] || fallbackIds[name];
        map[name] = `/graphql/${id}/${name}`;
    }
    return map;
}
