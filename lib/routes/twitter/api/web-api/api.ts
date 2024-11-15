import { baseUrl, gqlMap, gqlFeatures } from './constants';
import { config } from '@/config';
import cache from '@/utils/cache';
import { twitterGot, paginationTweets, gatherLegacyFromData } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const getUserData = (id) =>
    cache.tryGet(`twitter-userdata-${id}`, () => {
        if (id.startsWith('+')) {
            return twitterGot(`${baseUrl}${gqlMap.UserByRestId}`, {
                variables: JSON.stringify({
                    userId: id.slice(1),
                    withSafetyModeUserFields: true,
                }),
                features: JSON.stringify(gqlFeatures.UserByRestId),
                fieldToggles: JSON.stringify({
                    withAuxiliaryUserLabels: false,
                }),
            });
        }
        return twitterGot(
            `${baseUrl}${gqlMap.UserByScreenName}`,
            {
                variables: JSON.stringify({
                    screen_name: id,
                    withSafetyModeUserFields: true,
                }),
                features: JSON.stringify(gqlFeatures.UserByScreenName),
                fieldToggles: JSON.stringify({
                    withAuxiliaryUserLabels: false,
                }),
            },
            {
                allowNoAuth: true,
            }
        );
    });

const cacheTryGet = async (_id, params, func) => {
    const userData: any = await getUserData(_id);
    const id = (userData.data?.user || userData.data?.user_result)?.result?.rest_id;
    if (id === undefined) {
        cache.set(`twitter-userdata-${_id}`, '', config.cache.contentExpire);
        throw new InvalidParameterError('User not found');
    }
    const funcName = func.name;
    const paramsString = JSON.stringify(params);
    return cache.tryGet(`twitter:${id}:${funcName}:${paramsString}`, () => func(id, params), config.cache.routeExpire, false);
};

const getUserTweets = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) =>
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

const getUserTweetsAndReplies = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) =>
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

const getUserMedia = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) => {
        const cursorSource = await paginationTweets('UserMedia', id, {
            ...params,
            count: 20,
            includePromotedContent: false,
            withClientEventToken: false,
            withBirdwatchNotes: false,
            withVoice: true,
            withV2Timeline: true,
        });
        const cursor = cursorSource.find((i) => i.content?.cursorType === 'Top').content.value;
        return gatherLegacyFromData(
            await paginationTweets('UserMedia', id, {
                ...params,
                cursor,
                count: 20,
                includePromotedContent: false,
                withClientEventToken: false,
                withBirdwatchNotes: false,
                withVoice: true,
                withV2Timeline: true,
            })
        );
    });

const getUserLikes = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) =>
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

const getUserTweet = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) =>
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

const getSearch = async (keywords: string, params?: Record<string, any>) =>
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

const getList = async (id: string, params?: Record<string, any>) =>
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
        )
    );

const getUser = async (id: string) => {
    const userData: any = await getUserData(id);
    return (userData.data?.user || userData.data?.user_result)?.result?.legacy;
};

const getHomeTimeline = async (id: string, params?: Record<string, any>) =>
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

const getHomeLatestTimeline = async (id: string, params?: Record<string, any>) =>
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
    init: () => {},
};
