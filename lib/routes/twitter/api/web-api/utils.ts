import ConfigNotFoundError from '@/errors/types/config-not-found';
import { baseUrl, gqlFeatures, bearerToken, gqlMap } from './constants';
import { config } from '@/config';
import got from '@/utils/got';
import queryString from 'query-string';
import { Cookie } from 'tough-cookie';

export const twitterGot = async (url, params) => {
    if (!config.twitter.cookie) {
        throw new ConfigNotFoundError('Twitter cookie is not configured');
    }
    const jsonCookie = Object.fromEntries(
        config.twitter.cookie
            .split(';')
            .map((c) => Cookie.parse(c)?.toJSON())
            .map((c) => [c?.key, c?.value])
    );
    if (!jsonCookie || !jsonCookie.auth_token || !jsonCookie.ct0) {
        throw new ConfigNotFoundError('Twitter cookie is not valid');
    }

    const requestData = {
        url: `${url}?${queryString.stringify(params)}`,
        method: 'GET',
        headers: {
            authority: 'twitter.com',
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.9',
            authorization: bearerToken,
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            cookie: config.twitter.cookie,
            dnt: '1',
            pragma: 'no-cache',
            referer: 'https://twitter.com/narendramodi',
            'x-csrf-token': jsonCookie.ct0,
            'x-twitter-active-user': 'yes',
            'x-twitter-auth-type': 'OAuth2Session',
            'x-twitter-client-language': 'en',
        },
    };

    const response = await got(requestData.url, {
        headers: requestData.headers,
    });

    return response.data;
};

export const paginationTweets = async (endpoint: string, userId: number | undefined, variables: Record<string, any>, path?: string[]) => {
    const { data } = await twitterGot(baseUrl + gqlMap[endpoint], {
        variables: JSON.stringify({
            ...variables,
            userId,
        }),
        features: JSON.stringify(gqlFeatures[endpoint]),
    });
    let instructions;
    if (path) {
        instructions = data;
        for (const p of path) {
            instructions = instructions[p];
        }
        instructions = instructions.instructions;
    } else {
        if (data?.user?.result?.timeline_v2?.timeline?.instructions) {
            instructions = data.user.result.timeline_v2.timeline.instructions;
        } else {
            throw new Error('Because Twitter Premium has features that hide your likes, this RSS link is not available for Twitter Premium accounts.');
        }
    }

    const entries1 = instructions.find((i) => i.type === 'TimelineAddToModule')?.moduleItems; // Media
    const entries2 = instructions.find((i) => i.type === 'TimelineAddEntries').entries;
    return entries1 || entries2;
};

export function gatherLegacyFromData(entries: any[], filterNested?: string[], userId?: number | string) {
    const tweets: any[] = [];
    const filteredEntries: any[] = [];
    for (const entry of entries) {
        const entryId = entry.entryId;
        if (entryId) {
            if (entryId.startsWith('tweet-')) {
                filteredEntries.push(entry);
            } else if (entryId.startsWith('profile-grid-0-tweet-')) {
                filteredEntries.push(entry);
            }
            if (filterNested && filterNested.some((f) => entryId.startsWith(f))) {
                filteredEntries.push(...entry.content.items);
            }
        }
    }
    for (const entry of filteredEntries) {
        if (entry.entryId) {
            const content = entry.content || entry.item;
            let tweet = content?.content?.tweetResult?.result || content?.itemContent?.tweet_results?.result;
            if (tweet && tweet.tweet) {
                tweet = tweet.tweet;
            }
            if (tweet) {
                const retweet = tweet.legacy?.retweeted_status_result?.result;
                for (const t of [tweet, retweet]) {
                    if (!t?.legacy) {
                        continue;
                    }
                    t.legacy.user = t.core?.user_result?.result?.legacy || t.core?.user_results?.result?.legacy;
                    t.legacy.id_str = t.rest_id; // avoid falling back to conversation_id_str elsewhere
                    const quote = t.quoted_status_result?.result?.tweet || t.quoted_status_result?.result;
                    if (quote) {
                        t.legacy.quoted_status = quote.legacy;
                        t.legacy.quoted_status.user = quote.core.user_result?.result?.legacy || quote.core.user_results?.result?.legacy;
                    }
                }
                const legacy = tweet.legacy;
                if (legacy) {
                    if (retweet) {
                        legacy.retweeted_status = retweet.legacy;
                    }
                    if (userId === undefined || legacy.user_id_str === userId + '') {
                        tweets.push(legacy);
                    }
                }
            }
        }
    }

    return tweets;
}
