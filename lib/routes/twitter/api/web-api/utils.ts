import ConfigNotFoundError from '@/errors/types/config-not-found';
import { baseUrl, gqlFeatures, bearerToken, gqlMap, thirdPartySupportedAPI } from './constants';
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

const token2Cookie = async (token) => {
    const c = await cache.get(`twitter:cookie:${token}`);
    if (c) {
        return c;
    }
    const jar = new CookieJar();
    await jar.setCookie(`auth_token=${token}`, 'https://x.com');
    try {
        const agent = proxy.proxyUri
            ? new ProxyAgent({
                  factory: (origin, opts) => new CookieClient(origin as string, { ...opts, cookies: { jar } }),
                  uri: proxy.proxyUri,
              })
            : new CookieAgent({ cookies: { jar } });
        if (token) {
            await ofetch('https://x.com', {
                dispatcher: agent,
            });
        } else {
            const data = await ofetch('https://x.com/narendramodi?mx=2', {
                dispatcher: agent,
            });
            const gt = data.match(/document\.cookie="gt=(\d+)/)?.[1];
            if (gt) {
                jar.setCookieSync(`gt=${gt}`, 'https://x.com');
            }
        }
        const cookie = JSON.stringify(jar.serializeSync());
        cache.set(`twitter:cookie:${token}`, cookie);
        return cookie;
    } catch {
        // ignore
        return '';
    }
};

const lockPrefix = 'twitter:lock-token1:';

const getAuth = async (retry: number) => {
    if (config.twitter.authToken && retry > 0) {
        const index = authTokenIndex++ % config.twitter.authToken.length;
        const token = config.twitter.authToken[index];
        const lock = await cache.get(`${lockPrefix}${token}`, false);
        if (lock) {
            logger.debug(`twitter debug: twitter cookie for token ${token} is locked, retry: ${retry}`);
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

export const twitterGot = async (
    url,
    params,
    options?: {
        allowNoAuth?: boolean;
    }
) => {
    const auth = await getAuth(30);

    if (!auth && !options?.allowNoAuth) {
        throw new ConfigNotFoundError('No valid Twitter token found');
    }

    const requestUrl = `${url}?${queryString.stringify(params)}`;

    let cookie: string | Record<string, any> | null | undefined = await token2Cookie(auth?.token);
    if (!cookie && auth) {
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
        logger.debug(`twitter debug: got twitter cookie for token ${auth?.token}`);
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
    } else if (auth) {
        throw new ConfigNotFoundError(`Twitter cookie for token ${auth?.token?.replace(/(\w{8})(\w+)/, (_, v1, v2) => v1 + '*'.repeat(v2.length))} is not valid`);
    }
    const jsonCookie = dispatchers
        ? Object.fromEntries(
              dispatchers.jar
                  .getCookieStringSync(url)
                  .split(';')
                  .map((c) => Cookie.parse(c)?.toJSON())
                  .map((c) => [c?.key, c?.value])
          )
        : {};

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
            referer: 'https://x.com/',
            'x-twitter-active-user': 'yes',
            'x-twitter-client-language': 'en',
            'x-csrf-token': jsonCookie.ct0,
            ...(auth?.token
                ? {
                      'x-twitter-auth-type': 'OAuth2Session',
                  }
                : {
                      'x-guest-token': jsonCookie.gt,
                  }),
        },
        dispatcher: dispatchers?.agent,
        onResponse: async ({ response }) => {
            const remaining = response.headers.get('x-rate-limit-remaining');
            const remainingInt = Number.parseInt(remaining || '0');
            const reset = response.headers.get('x-rate-limit-reset');
            logger.debug(
                `twitter debug: twitter rate limit remaining for token ${auth?.token} is ${remaining} and reset at ${reset}, auth: ${JSON.stringify(auth)}, status: ${response.status}, data: ${JSON.stringify(response._data?.data)}, cookie: ${JSON.stringify(dispatchers?.jar.serializeSync())}`
            );
            if (auth) {
                if (remaining && remainingInt < 2 && reset) {
                    const resetTime = new Date(Number.parseInt(reset) * 1000);
                    const delay = (resetTime.getTime() - Date.now()) / 1000;
                    logger.debug(`twitter debug: twitter rate limit exceeded for token ${auth.token} with status ${response.status}, will unlock after ${delay}s`);
                    await cache.set(`${lockPrefix}${auth.token}`, '1', Math.ceil(delay) * 2);
                } else if (response.status === 429 || JSON.stringify(response._data?.data) === '{"user":{}}') {
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
                } else {
                    logger.debug(`twitter debug: unlock twitter cookie with success for token ${auth.token}`);
                    await cache.set(`${lockPrefix}${auth.token}`, '', 1);
                }
            }
        },
    });

    if (auth?.token) {
        logger.debug(`twitter debug: update twitter cookie for token ${auth.token}`);
        await cache.set(`twitter:cookie:${auth.token}`, JSON.stringify(dispatchers?.jar.serializeSync()), config.cache.contentExpire);
    }

    return response._data;
};

export const paginationTweets = async (endpoint: string, userId: number | undefined, variables: Record<string, any>, path?: string[]) => {
    const params = {
        variables: JSON.stringify({ ...variables, userId }),
        features: JSON.stringify(gqlFeatures[endpoint]),
    };

    const fetchData = async () => {
        if (config.twitter.thirdPartyApi && thirdPartySupportedAPI.includes(endpoint)) {
            const { data } = await ofetch(`${config.twitter.thirdPartyApi}${gqlMap[endpoint]}`, {
                method: 'GET',
                params,
            });
            return data;
        }
        const { data } = await twitterGot(baseUrl + gqlMap[endpoint], params);
        return data;
    };

    const getInstructions = (data: any) => {
        if (path) {
            let instructions = data;
            for (const p of path) {
                instructions = instructions[p];
            }
            return instructions.instructions;
        }

        const instructions = data?.user?.result?.timeline_v2?.timeline?.instructions;
        if (!instructions) {
            logger.debug(`twitter debug: instructions not found in data: ${JSON.stringify(data)}`);
        }
        return instructions;
    };

    const data = await fetchData();
    const instructions = getInstructions(data);
    if (!instructions) {
        return [];
    }

    const moduleItems = instructions.find((i) => i.type === 'TimelineAddToModule')?.moduleItems;
    const entries = instructions.find((i) => i.type === 'TimelineAddEntries')?.entries;

    return moduleItems || entries || [];
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
                    if (t.note_tweet) {
                        const tmp = t.note_tweet.note_tweet_results.result;
                        t.legacy.entities.hashtags = tmp.entity_set.hashtags;
                        t.legacy.entities.symbols = tmp.entity_set.symbols;
                        t.legacy.entities.urls = tmp.entity_set.urls;
                        t.legacy.entities.user_mentions = tmp.entity_set.user_mentions;
                        t.legacy.full_text = tmp.text;
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
