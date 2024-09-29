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

const lockPrefix = 'twitter:lock-token1:';

const getAuth = async (retry: number) => {
    if (config.twitter.authToken && retry > 0) {
        const index = authTokenIndex++ % config.twitter.authToken.length;
        const token = config.twitter.authToken[index];
        const lock = await cache.get(`${lockPrefix}${token}`, false);
        if (lock) {
            await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 500));
            return await getAuth(retry - 1);
        } else {
            logger.debug(`twitter debug: lock twitter cookie for token ${token}`);
            await cache.set(`${lockPrefix}${token}`, '1', 20);
            return {
                token,
                username: config.twitter.username?.[index],
                password: config.twitter.password?.[index],
                authenticationSecret: config.twitter.authenticationSecret?.[index],
            };
        }
    }
};

export const twitterGot = async (url, params) => {
    const auth = await getAuth(30);

    if (!auth) {
        throw new ConfigNotFoundError('No valid Twitter token found');
    }

    const requestUrl = `${url}?${queryString.stringify(params)}`;

    let cookie: string | Record<string, any> | null | undefined = await token2Cookie(auth.token);
    if (!cookie) {
        cookie = await login({
            username: auth.username,
            password: auth.password,
            authenticationSecret: auth.authenticationSecret,
        });
    }
    let dispatchers:
        | {
              jar: CookieJar;
              agent: CookieAgent | ProxyAgent;
          }
        | undefined;
    if (cookie) {
        logger.debug(`twitter debug: got twitter cookie for token ${auth.token}`);
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
            logger.debug(`twitter debug: Proxying request: ${requestUrl}`);
        }
        dispatchers = {
            jar,
            agent,
        };
    } else {
        throw new ConfigNotFoundError(`Twitter cookie for token ${auth.token} is not valid`);
    }
    const jsonCookie = Object.fromEntries(
        dispatchers.jar
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
        dispatcher: dispatchers.agent,
        onResponse: async ({ response }) => {
            if (response.status === 429 || JSON.stringify(response._data?.data) === '{"user":{}}') {
                logger.debug(`twitter debug: twitter rate limit exceeded for token ${auth.token} with status ${response.status}`);
                await cache.set(`${lockPrefix}${auth.token}`, '1', 2000);
            } else if (response.status === 403 || response.status === 401) {
                const newCookie = await login({
                    username: auth.username,
                    password: auth.password,
                    authenticationSecret: auth.authenticationSecret,
                });
                if (newCookie) {
                    logger.debug(`twitter debug: reset twitter cookie for token ${auth.token}, ${newCookie}`);
                    await cache.set(`twitter:cookie:${auth.token}`, newCookie, config.cache.contentExpire);
                    logger.debug(`twitter debug: unlock twitter cookie for token ${auth.token} with error1`);
                    await cache.set(`${lockPrefix}${auth.token}`, '', 1);
                } else {
                    const tokenIndex = config.twitter.authToken?.indexOf(auth.token);
                    if (tokenIndex !== undefined && tokenIndex !== -1) {
                        config.twitter.authToken?.splice(tokenIndex, 1);
                    }
                    if (auth.username) {
                        const usernameIndex = config.twitter.username?.indexOf(auth.username);
                        if (usernameIndex !== undefined && usernameIndex !== -1) {
                            config.twitter.username?.splice(usernameIndex, 1);
                        }
                    }
                    if (auth.password) {
                        const passwordIndex = config.twitter.password?.indexOf(auth.password);
                        if (passwordIndex !== undefined && passwordIndex !== -1) {
                            config.twitter.password?.splice(passwordIndex, 1);
                        }
                    }
                    logger.debug(`twitter debug: delete twitter cookie for token ${auth.token} with status ${response.status}, remaining tokens: ${config.twitter.authToken?.length}`);
                    await cache.set(`${lockPrefix}${auth.token}`, '1', 86400);
                }
            }
        },
    });

    if (auth.token) {
        logger.debug(`twitter debug: update twitter cookie for token ${auth.token}`);
        await cache.set(`twitter:cookie:${auth.token}`, JSON.stringify(dispatchers.jar.serializeSync()), config.cache.contentExpire);
        logger.debug(`twitter debug: unlock twitter cookie with success for token ${auth.token}`);
        await cache.set(`${lockPrefix}${auth.token}`, '', 1);
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
            logger.debug(`twitter debug: instructions not found in data: ${JSON.stringify(data)}`);
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
