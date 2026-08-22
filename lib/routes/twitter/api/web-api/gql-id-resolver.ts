import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const CACHE_KEY = 'twitter:gql-query-ids';

// Hardcoded fallback IDs (last known working values)
export const fallbackIds: Record<string, string> = {
    UserTweets: 'eoJ5zbv51Z_KVl81v9PmLQ',
    UserByScreenName: 'Gb-d6r0vxPOADdG62OEBpQ',
    HomeTimeline: '3b9_7tltt0hJRef-xm_3sw',
    HomeLatestTimeline: 'm1G65W9TS1-g-AllrKKYDQ',
    UserTweetsAndReplies: 'wc5DRl4VaW5lSqJ8YbftZQ',
    UserMedia: '2DC9TKrcUzwGC_QskSVl5w',
    UserByRestId: 'xvmVfRLmnr1alc5f2dib0Q',
    SearchTimeline: 'BGd0T_j7oVwlW5U79tO_0A',
    ListLatestTweetsTimeline: 'jW040BLUjh8X6Tw2ODQufA',
    TweetDetail: '559hs_YZNV4IgA3Z6zIIuw',
};

const operationNames = Object.keys(fallbackIds);

async function fetchAndExtractIds(): Promise<Record<string, string>> {
    const api = await ofetch('https://cdn.jsdelivr.net/gh/fa0311/TwitterInternalAPIDocument@master/docs/json/API.json');

    const ids: Record<string, string> = {};
    for (const name of operationNames) {
        const queryId = api?.graphql?.[name]?.queryId;
        if (typeof queryId === 'string') {
            ids[name] = queryId;
        }
    }
    return ids;
}

let resolvePromise: Promise<Record<string, string>> | null = null;

export async function resolveQueryIds(): Promise<Record<string, string>> {
    // Check cache first
    const cached = await cache.get(CACHE_KEY);
    if (cached) {
        try {
            const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                logger.debug('twitter gql-id-resolver: using cached query IDs');
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
                logger.info('twitter gql-id-resolver: fetching fresh query IDs from TwitterInternalAPIDocument');
                const ids = await fetchAndExtractIds();

                if (Object.keys(ids).length > 0) {
                    await cache.set(CACHE_KEY, JSON.stringify(ids), config.cache.contentExpire);
                    const found = operationNames.filter((name) => ids[name]);
                    const missing = operationNames.filter((name) => !Object.hasOwn(ids, name));
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
