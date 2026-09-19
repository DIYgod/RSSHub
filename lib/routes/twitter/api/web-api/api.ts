import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { getTwitterUserCacheKey } from '../../utils';
import { baseUrl, gqlFeatures, gqlMap, initGqlMap } from './constants';
import type { ApiParams } from './utils';
import { gatherLegacyFromData, paginationTweets, twitterGot } from './utils';

const getUserResult = (response: any) => {
    const errors = response?.errors;
    if (errors !== undefined && errors !== null && (!Array.isArray(errors) || errors.length > 0)) {
        const codes = Array.isArray(errors) ? [...new Set(errors.map((error) => error?.code).filter((code) => Number.isSafeInteger(code)))] : [];
        throw new Error(`Twitter API user lookup failed${codes.length ? ` (codes: ${codes.join(', ')})` : ''}`);
    }

    // Some third-party providers return errors with HTTP 200 outside GraphQL.
    const code = response?.code;
    if (Number.isSafeInteger(code) && code >= 400) {
        if (code === 404 && response.message === 'User not found') {
            throw new InvalidParameterError('Twitter API could not find this user');
        }
        throw new Error(`Twitter API user lookup failed (code: ${code})`);
    }

    const user = response?.data?.user;
    if (user === null || user?.result === null) {
        throw new InvalidParameterError("This account doesn't exist");
    }
    const result = user?.result;
    if (result?.__typename === 'UserUnavailable') {
        throw new InvalidParameterError('Twitter user is unavailable');
    }
    if (!result || typeof result.rest_id !== 'string' || result.rest_id.length === 0) {
        throw new Error('Twitter API returned an incomplete user response');
    }
    return result;
};

const getUserData = async (id: string) => {
    // Other Twitter API adapters cache different schemas under the legacy key.
    const data = await cache.tryGet(`twitter:web:userdata:v2:${id}`, async () => {
        const params = {
            variables: id.startsWith('+')
                ? JSON.stringify({
                      userId: id.slice(1),
                      withSafetyModeUserFields: true,
                  })
                : JSON.stringify({
                      screen_name: id,
                      withSafetyModeUserFields: true,
                  }),
            features: JSON.stringify(id.startsWith('+') ? gqlFeatures.UserByRestId : gqlFeatures.UserByScreenName),
            fieldToggles: JSON.stringify({
                withAuxiliaryUserLabels: false,
            }),
        };

        const response = config.twitter.thirdPartyApi
            ? await ofetch(`${config.twitter.thirdPartyApi}${id.startsWith('+') ? gqlMap.UserByRestId : gqlMap.UserByScreenName}`, {
                  method: 'GET',
                  params,
                  headers: {
                      'accept-encoding': 'gzip',
                  },
              })
            : await twitterGot(`${baseUrl}${id.startsWith('+') ? gqlMap.UserByRestId : gqlMap.UserByScreenName}`, params, {
                  allowNoAuth: !id.startsWith('+'),
              });

        // HTTP 200 can still contain GraphQL errors; never cache those responses.
        getUserResult(response);
        return response;
    });
    return getUserResult(data);
};

const cacheTryGet = async (_id, params, operationName, func) => {
    const user = await getUserData(_id);
    return cache.tryGet(getTwitterUserCacheKey(user.rest_id, operationName, params), () => func(user.rest_id, params), config.cache.routeExpire, false);
};

const getUserTweets = (id: string, params?: ApiParams) =>
    cacheTryGet(id, params, 'getUserTweets', async (id, params = {}) =>
        gatherLegacyFromData(
            await paginationTweets('UserTweets', id, {
                ...params,
                count: 20,
                includePromotedContent: true,
                withQuickPromoteEligibilityTweetFields: true,
                withVoice: true,
                withV2Timeline: true,
            })
        )
    );

const getUserTweetsAndReplies = (id: string, params?: ApiParams) =>
    cacheTryGet(id, params, 'getUserTweetsAndReplies', async (id, params = {}) =>
        gatherLegacyFromData(
            await paginationTweets('UserTweetsAndReplies', id, {
                ...params,
                count: 20,
                includePromotedContent: true,
                withCommunity: true,
                withVoice: true,
                withV2Timeline: true,
            }),
            ['profile-conversation-'],
            id
        )
    );

const getUserMedia = (id: string, params?: ApiParams) =>
    cacheTryGet(id, params, 'getUserMedia', async (id, params = {}) =>
        gatherLegacyFromData(
            await paginationTweets('UserMedia', id, {
                ...params,
                count: 20,
                includePromotedContent: false,
                withClientEventToken: false,
                withBirdwatchNotes: false,
                withVoice: true,
                withV2Timeline: true,
            })
        )
    );

const getUserLikes = (id: string, params?: ApiParams) =>
    cacheTryGet(id, params, 'getUserLikes', async (id, params = {}) =>
        gatherLegacyFromData(
            await paginationTweets('Likes', id, {
                ...params,
                includeHasBirdwatchNotes: false,
                includePromotedContent: false,
                withBirdwatchNotes: false,
                withVoice: false,
                withV2Timeline: true,
            })
        )
    );

const getUserTweet = (id: string, params?: ApiParams) =>
    cacheTryGet(id, params, 'getUserTweet', async (id, params = {}) =>
        gatherLegacyFromData(
            await paginationTweets(
                'TweetDetail',
                id,
                {
                    ...params,
                    includeHasBirdwatchNotes: false,
                    includePromotedContent: false,
                    withBirdwatchNotes: false,
                    withVoice: false,
                    withV2Timeline: true,
                },
                ['threaded_conversation_with_injections_v2']
            ),
            ['homeConversation-', 'conversationthread-']
        )
    );

const getSearch = async (keywords: string, params?: ApiParams) =>
    gatherLegacyFromData(
        await paginationTweets(
            'SearchTimeline',
            undefined,
            {
                ...params,
                rawQuery: keywords,
                count: 20,
                querySource: 'typed_query',
                product: 'Latest',
            },
            ['search_by_raw_query', 'search_timeline', 'timeline']
        )
    );

const getList = async (id: string, params?: ApiParams) =>
    gatherLegacyFromData(
        await paginationTweets(
            'ListLatestTweetsTimeline',
            undefined,
            {
                ...params,
                listId: id,
                count: 20,
            },
            ['list', 'tweets_timeline', 'timeline']
        ),
        ['listConversation-']
    );

const getUser = async (id: string) => {
    const user = await getUserData(id);
    return {
        profile_image_url: user.avatar?.image_url,
        description: user.profile_bio?.description,
        ...user.core,
    };
};

const getHomeTimeline = async (id: string, params?: ApiParams) =>
    gatherLegacyFromData(
        await paginationTweets(
            'HomeTimeline',
            undefined,
            {
                ...params,
                count: 20,
                includePromotedContent: true,
                latestControlAvailable: true,
                requestContext: 'launch',
                withCommunity: true,
            },
            ['home', 'home_timeline_urt']
        )
    );

const getHomeLatestTimeline = async (id: string, params?: ApiParams) =>
    gatherLegacyFromData(
        await paginationTweets(
            'HomeLatestTimeline',
            undefined,
            {
                ...params,
                count: 20,
                includePromotedContent: true,
                latestControlAvailable: true,
                requestContext: 'launch',
                withCommunity: true,
            },
            ['home', 'home_timeline_urt']
        )
    );

export default {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    getUserLikes,
    getUserTweet,
    getSearch,
    getList,
    getHomeTimeline,
    getHomeLatestTimeline,
    init: initGqlMap,
};
