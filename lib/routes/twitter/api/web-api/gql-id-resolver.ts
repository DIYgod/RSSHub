import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const CACHE_KEY = 'twitter:gql-query-ids';

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
        parseResponse: (txt) => txt,
    });
    return response as unknown as string;
}

function extractQueryIds(scriptContent: string): Record<string, string> {
    const ids: Record<string, string> = {};
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

    // Extract main.hash.js URL — it contains all the GraphQL query IDs we need
    const mainMatch = html.match(/\/client-web\/main\.([a-z0-9]+)\./);
    if (!mainMatch) {
        logger.warn('twitter gql-id-resolver: main.js URL not found in Twitter page');
        return {};
    }

    const mainUrl = `https://abs.twimg.com/responsive-web/client-web/main.${mainMatch[1]}.js`;
    logger.debug(`twitter gql-id-resolver: fetching ${mainUrl}`);

    const content = await ofetch(mainUrl, {
        parseResponse: (txt) => txt,
    });
    return extractQueryIds(content as unknown as string);
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
                    await cache.set(CACHE_KEY, JSON.stringify(ids), config.cache.contentExpire);
                    const found = operationNames.filter((name) => ids[name]);
                    const missing = operationNames.filter((name) => !ids[name]);
                    logger.debug(`twitter gql-id-resolver: resolved ${found.length}/${operationNames.length} query IDs. Missing: ${missing.join(', ') || 'none'}`);
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
