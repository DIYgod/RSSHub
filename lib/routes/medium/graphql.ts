// @ts-nocheck
import got from '@/utils/got';

async function graphqlRequest(body, cookie) {
    const { data } = await got('https://medium.com/_/graphql', {
        method: 'POST',
        headers: {
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.9,zh;q=0.8,zh-CN;q=0.7',
            'apollographql-client-name': 'lite',
            'apollographql-client-version': 'main-20230505-195233-209f54c418',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'medium-frontend-app': 'lite/main-20230505-195233-209f54c418',
            'medium-frontend-path': '/',
            'medium-frontend-route': 'homepage',
            'ot-tracer-sampled': 'true',
            'ot-tracer-spanid': '2db0b0d7263ffad8',
            'ot-tracer-traceid': '679eb621b33147c4',
            pragma: 'no-cache',
            'sec-ch-ua': '"Chromium";v="113", "Not-A.Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'graphql-operation': body.operationName,
            cookie,
        },
        data: JSON.stringify([body]),
    });
    return data[0].data;
}

async function getFollowingFeedQuery(user, cookie, pagingLimit = 20) {
    return (await graphqlRequest(newFollowingFeedQuery(pagingLimit), cookie))?.followingFeed;
}

async function getWebInlineRecommendedFeedQuery(user, cookie, pagingLimit = 20) {
    return (await graphqlRequest(newWebInlineRecommendedFeedQuery(pagingLimit), cookie))?.webRecommendedFeed;
}

async function getWebInlineTopicFeedQuery(user, tagSlug, cookie, pagingLimit = 20) {
    return (await graphqlRequest(newWebInlineTopicFeedQuery(tagSlug, pagingLimit), cookie))?.personalisedTagFeed;
}

async function getUserCatalogMainContentQuery(user, catalogId, cookie, pagingLimit = 20) {
    return (await graphqlRequest(newUserCatalogMainContentQuery(catalogId, pagingLimit), cookie))?.catalogById;
}

module.exports = {
    getWebInlineRecommendedFeedQuery,
    getFollowingFeedQuery,
    getWebInlineTopicFeedQuery,
    getUserCatalogMainContentQuery,
};

function newFollowingFeedQuery(pagingLimit = 5) {
    return {
        operationName: 'FollowingFeedQuery',
        variables: {
            paging: {
                limit: pagingLimit,
            },
        },
        query: `query FollowingFeedQuery($paging: PagingOptions) {
            followingFeed(paging: $paging) {
              items {
                feedId
                post {
                  mediumUrl
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
        }`,
    };
}

function newWebInlineRecommendedFeedQuery(pagingLimit = 5) {
    return {
        operationName: 'WebInlineRecommendedFeedQuery',
        variables: {
            forceRank: true,
            paging: {
                limit: pagingLimit,
            },
        },
        query: `query WebInlineRecommendedFeedQuery($paging: PagingOptions, $forceRank: Boolean) {
            webRecommendedFeed(paging: $paging, forceRank: $forceRank) {
              items {
                feedId
                post {
                  mediumUrl
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
        }`,
    };
}

function newWebInlineTopicFeedQuery(tagSlug, pagingLimit = 5) {
    return {
        operationName: 'WebInlineTopicFeedQuery',
        variables: {
            tagSlug,
            paging: {
                limit: pagingLimit,
            },
            skipCache: true,
        },
        query: `query WebInlineTopicFeedQuery($tagSlug: String!, $paging: PagingOptions!, $skipCache: Boolean) {
            personalisedTagFeed(tagSlug: $tagSlug, paging: $paging, skipCache: $skipCache) {
              items {
                feedId
                post {
                  mediumUrl
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
        }`,
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
        query: `query UserCatalogMainContentQuery($catalogId: ID!, $pagingOptions: CatalogPagingOptionsInput!) {
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
          }`,
    };
}
