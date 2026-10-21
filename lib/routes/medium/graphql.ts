import got from '@/utils/got';

import { type GetMediumBrowser, isMediumChallenge } from './browser';

export type PostPreview = {
    mediumUrl: string;
    title: string;
    firstPublishedAt: number;
    creator?: { name?: string };
    extendedPreviewContent?: { subtitle?: string };
};

type Feed = { items: Array<{ post: PostPreview }> };

const postPreviewFields = `
    id
    title
    firstPublishedAt
    creator { name }
    extendedPreviewContent { isFullContent subtitle }
`;

async function browserGraphqlRequest(browser: Awaited<ReturnType<GetMediumBrowser>>, body, headers, retry = true): Promise<{ status: number; data: unknown; challenge: boolean }> {
    const response = await browser.page.evaluate(
        async ({ body, headers }) => {
            const response = await fetch('https://medium.com/_/graphql', {
                method: 'POST',
                redirect: 'manual',
                headers,
                body,
            });
            return {
                status: response.status,
                data: response.ok ? await response.json() : undefined,
                challenge: response.status === 403 && /cf-chl|challenge-platform|Just a moment/i.test(await response.text()),
            };
        },
        { body: JSON.stringify([body]), headers }
    );
    if (retry && response.status === 403 && response.challenge) {
        await browser.page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
        if (new URL(browser.page.url()).origin !== 'https://medium.com') {
            throw new Error('The Medium browser source redirected outside its expected origin.');
        }
        return browserGraphqlRequest(browser, body, headers, false);
    }
    return response;
}

async function graphqlRequest(body, cookie, getBrowser?: GetMediumBrowser) {
    const headers = {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,zh;q=0.8,zh-CN;q=0.7',
        'apollographql-client-name': 'lite',
        'apollographql-client-version': 'main-20240329-011934-2370d8b72b',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'medium-frontend-app': 'lite/main-20240329-011934-2370d8b72b',
        'medium-frontend-path': '/',
        'medium-frontend-route': 'homepage',
        'ot-tracer-sampled': 'true',
        'ot-tracer-spanid': '26b843316dc9494d',
        'ot-tracer-traceid': 'c84ea9154765033',
        pragma: 'no-cache',
        'sec-ch-ua': '"Chromium";v="123", "Not:A-Brand";v="8"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'graphql-operation': body.operationName,
        cookie,
    };
    let data;
    try {
        ({ data } = await got('https://medium.com/_/graphql', {
            method: 'POST',
            redirect: 'manual',
            headers,
            body: JSON.stringify([body]),
        }));
    } catch (error) {
        if (!getBrowser || !isMediumChallenge(error)) {
            throw error;
        }
        const browser = await getBrowser();
        const publicHeaders = Object.fromEntries(Object.entries(headers).filter(([name]) => name !== 'cookie'));
        const response = await browserGraphqlRequest(browser, body, publicHeaders);
        if (response.status !== 200) {
            throw new Error(`The Medium GraphQL source returned HTTP ${response.status}. Verify the session and try again later.`, { cause: error });
        }
        data = response.data;
    }
    if (!Array.isArray(data)) {
        throw new TypeError('The Medium GraphQL source did not return its expected JSON response.');
    }
    return data[0].data;
}

async function getFollowingFeedQuery(user, cookie, pagingLimit = 20, getBrowser?: GetMediumBrowser): Promise<Feed | undefined> {
    return (await graphqlRequest(newFollowingFeedQuery(pagingLimit), cookie, getBrowser))?.followingFeed;
}

async function getWebInlineRecommendedFeedQuery(user, cookie, pagingLimit = 20, getBrowser?: GetMediumBrowser): Promise<Feed | undefined> {
    return (await graphqlRequest(newWebInlineRecommendedFeedQuery(pagingLimit), cookie, getBrowser))?.webRecommendedFeed;
}

async function getWebInlineTopicFeedQuery(user, tagSlug, cookie, pagingLimit = 20, getBrowser?: GetMediumBrowser): Promise<Feed | undefined> {
    return (await graphqlRequest(newWebInlineTopicFeedQuery(tagSlug, pagingLimit), cookie, getBrowser))?.personalisedTagFeed;
}

async function getUserCatalogMainContentQuery(user, catalogId, cookie, pagingLimit = 20) {
    return (await graphqlRequest(newUserCatalogMainContentQuery(catalogId, pagingLimit), cookie))?.catalogById;
}

export { getFollowingFeedQuery, getUserCatalogMainContentQuery, getWebInlineRecommendedFeedQuery, getWebInlineTopicFeedQuery };

function newFollowingFeedQuery(pagingLimit = 5) {
    return {
        operationName: 'LegacyFollowingFeedQuery',
        variables: {
            paging: {
                limit: pagingLimit,
            },
        },
        query: /* GraphQL */ `
            query LegacyFollowingFeedQuery($paging: PagingOptions) {
                followingFeed(paging: $paging) {
                    items {
                        feedId
                        post {
                            mediumUrl
                            ${postPreviewFields}
                            __typename
                        }
                        __typename
                    }
                    pagingInfo {
                        next {
                            to
                            from
                            limit
                            source
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        `,
    };
}

function newWebInlineRecommendedFeedQuery(pagingLimit = 5) {
    return {
        operationName: 'LegacyWebInlineRecommendedFeedQuery',
        variables: {
            forceRank: true,
            paging: {
                limit: pagingLimit,
            },
        },
        query: /* GraphQL */ `
            query LegacyWebInlineRecommendedFeedQuery($paging: PagingOptions, $forceRank: Boolean) {
                webRecommendedFeed(paging: $paging, forceRank: $forceRank) {
                    items {
                        feedId
                        post {
                            mediumUrl
                            ${postPreviewFields}
                            __typename
                        }
                        __typename
                    }
                    pagingInfo {
                        next {
                            limit
                            to
                            source
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        `,
    };
}

function newWebInlineTopicFeedQuery(tagSlug, pagingLimit = 5) {
    return {
        operationName: 'LegacyWebInlineTopicFeedQuery',
        variables: {
            tagSlug,
            paging: {
                limit: pagingLimit,
            },
            skipCache: true,
        },
        query: /* GraphQL */ `
            query LegacyWebInlineTopicFeedQuery($tagSlug: String!, $paging: PagingOptions!, $skipCache: Boolean) {
                personalisedTagFeed(tagSlug: $tagSlug, paging: $paging, skipCache: $skipCache) {
                    items {
                        feedId
                        post {
                            mediumUrl
                            ${postPreviewFields}
                            __typename
                        }
                        __typename
                    }
                    pagingInfo {
                        next {
                            source
                            limit
                            from
                            to
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        `,
    };
}

function newUserCatalogMainContentQuery(catalogId, pagingLimit = 20) {
    return {
        operationName: 'UserCatalogMainContentQuery',
        variables: {
            catalogId,
            pagingOptions: {
                limit: pagingLimit,
            },
        },
        query: /* GraphQL */ `
            query UserCatalogMainContentQuery($catalogId: ID!, $pagingOptions: CatalogPagingOptionsInput!) {
                catalogById(catalogId: $catalogId) {
                    __typename
                    ... on Catalog {
                        name
                        itemsConnection(pagingOptions: $pagingOptions) {
                            items {
                                entity {
                                    ... on Post {
                                        mediumUrl
                                    }
                                }
                                __typename
                            }
                            __typename
                        }
                    }
                }
            }
        `,
    };
}
