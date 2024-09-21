import ConfigNotFoundError from '@/errors/types/config-not-found';
import { baseUrl, gqlFeatures, bearerToken, gqlMap } from './constants';
import { config } from '@/config';
import queryString from 'query-string';
import { Cookie, CookieJar } from 'tough-cookie';
import { CookieAgent, CookieClient } from 'http-cookie-agent/undici';
import { ProxyAgent } from 'undici';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import proxy from '@/utils/proxy';
import login from './login';

const dispatchers = {};
let authTokenIndex = 0;

const token2Cookie = (token) =>
    cache.tryGet(`twitter:cookie:${token}`, async () => {
        const jar = new CookieJar();
        jar.setCookieSync(`auth_token=${token}`, 'https://x.com');
        try {
            const agent = proxy.proxyUri
                ? new ProxyAgent({
                      factory: (origin, opts) => new CookieClient(origin as string, { ...opts, cookies: { jar } }),
                      uri: proxy.proxyUri,
                  })
                : new CookieAgent({ cookies: { jar } });
            await ofetch('https://x.com', {
                dispatcher: agent,
            });
            return JSON.stringify(jar.serializeSync());
        } catch {
            // ignore
            return '';
        }
    });

export const twitterGot = async (url, params) => {
    if (!config.twitter.authToken) {
        throw new ConfigNotFoundError('Twitter cookie is not configured');
    }
    const index = authTokenIndex++ % config.twitter.authToken.length;
    const token = config.twitter.authToken[index];

    const requestUrl = `${url}?${queryString.stringify(params)}`;

    let cookie: string | Record<string, any> | null | undefined = await token2Cookie(token);
    if (!cookie) {
        cookie = await login({
            username: config.twitter.username?.[index],
            password: config.twitter.password?.[index],
            authenticationSecret: config.twitter.authenticationSecret?.[index],
        });
    }
    if (cookie) {
        logger.debug(`Got twitter cookie for token ${token}`);
        if (typeof cookie === 'string') {
            cookie = JSON.parse(cookie);
        }
        const jar = CookieJar.deserializeSync(cookie as any);
        const agent = proxy.proxyUri
            ? new ProxyAgent({
                  factory: (origin, opts) => new CookieClient(origin as string, { ...opts, cookies: { jar } }),
                  uri: proxy.proxyUri,
              })
            : new CookieAgent({ cookies: { jar } });
        if (proxy.proxyUri) {
            logger.debug(`Proxying request: ${requestUrl}`);
        }
        dispatchers[token] = {
            jar,
            agent,
        };
    } else {
        throw new ConfigNotFoundError(`Twitter cookie for token ${token} is not valid`);
    }
    const jsonCookie = Object.fromEntries(
        dispatchers[token].jar
            .getCookieStringSync(url)
            .split(';')
            .map((c) => Cookie.parse(c)?.toJSON())
            .map((c) => [c?.key, c?.value])
    );

    const response = await ofetch.raw(requestUrl, {
        retry: 0,
        headers: {
            authority: 'x.com',
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.9',
            authorization: bearerToken,
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            dnt: '1',
            pragma: 'no-cache',
            referer: 'https://x.com/narendramodi',
            'x-twitter-active-user': 'yes',
            'x-twitter-auth-type': 'OAuth2Session',
            'x-twitter-client-language': 'en',
            'x-csrf-token': jsonCookie.ct0,
        },
        dispatcher: dispatchers[token].agent,
        onResponse: async ({ response }) => {
            if (response.status === 403 || response.status === 401 || response.status === 429 || JSON.stringify(response._data?.data) === '{"user":{}}') {
                const newCookie = await login({
                    username: config.twitter.username?.[index],
                    password: config.twitter.password?.[index],
                    authenticationSecret: config.twitter.authenticationSecret?.[index],
                });
                if (newCookie) {
                    await cache.set(`twitter:cookie:${token}`, newCookie, config.cache.contentExpire);
                    logger.debug(`Reset twitter cookie for token ${token}`);
                } else {
                    config.twitter.authToken?.splice(index, 1);
                    config.twitter.username?.splice(index, 1);
                    config.twitter.password?.splice(index, 1);
                    await cache.set(`twitter:cookie:${token}`, '', config.cache.contentExpire);
                    logger.debug(`Delete twitter cookie for token ${token}, remaining tokens: ${config.twitter.authToken?.length}`);
                }
            }
        },
    });

    if (token) {
        logger.debug(`Update twitter cookie for token ${token}`);
        await cache.set(`twitter:cookie:${token}`, JSON.stringify(dispatchers[token].jar.serializeSync()), config.cache.contentExpire);
    }

    return response._data;
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
            // throw new Error('Because Twitter Premium has features that hide your likes, this RSS link is not available for Twitter Premium accounts.');
            logger.debug(`Instructions not found in data: ${JSON.stringify(data)}`);
        }
    }

    const entries1 = instructions?.find((i) => i.type === 'TimelineAddToModule')?.moduleItems; // Media
    const entries2 = instructions?.find((i) => i.type === 'TimelineAddEntries').entries;
    return entries1 || entries2 || [];
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
