import { baseUrl, gqlMap, gqlFeatures, gqlFieldToggles } from './constants';
import { config } from '@/config';
import cache from '@/utils/cache';
import { twitterGot, paginationTweets, gatherLegacyFromData } from './utils';

const getUserData = (id) =>
    cache.tryGet(`twitter-userdata-${id}`, () => {
        if (id.startsWith('+')) {
            return twitterGot(`${baseUrl}${gqlMap.UserByRestId}`, {
                variables: JSON.stringify({
                    userId: id.slice(1),
                    withSafetyModeUserFields: true,
                }),
                features: JSON.stringify(gqlFeatures.UserByRestId),
                fieldToggles: JSON.stringify(gqlFieldToggles.UserByScreenName),
            });
        }
        return twitterGot(`${baseUrl}${gqlMap.UserByScreenName}`, {
            variables: JSON.stringify({
                screen_name: id,
                withSafetyModeUserFields: true,
            }),
            features: JSON.stringify(gqlFeatures.UserByScreenName),
            fieldToggles: JSON.stringify(gqlFieldToggles.UserByScreenName),
        });
    });

const cacheTryGet = async (_id, params, func) => {
    const userData: any = await getUserData(_id);
    const id = (userData.data?.user || userData.data?.user_result)?.result?.rest_id;
    if (id === undefined) {
        throw new Error('User not found');
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
                withQuickPromoteEligibilityTweetFields: true,
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

const getUserMedia = (id: string, params?: Record<string, any>) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets('MediaTimeline', id, params)));

const getUserLikes = (id: string, params?: Record<string, any>) => cacheTryGet(id, params, async (id, params = {}) => gatherLegacyFromData(await paginationTweets('Likes', id, params)));

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
                product: 'Latest',
                withDownvotePerspective: false,
                withReactionsMetadata: false,
                withReactionsPerspective: false,
            },
            ['search_by_raw_query', 'search_timeline', 'timeline']
        )
    );

const getUser = async (id: string) => {
    const userData: any = await getUserData(id);
    return (userData.data?.user || userData.data?.user_result)?.result?.legacy;
};

export default {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    getUserLikes,
    getUserTweet,
    getSearch,
    init: () => {},
};
