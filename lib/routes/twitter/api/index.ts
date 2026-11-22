import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

import devApi from './developer-api/api';
// import mobileApi from './mobile-api/api';
import webApi from './web-api/api';
import type { ApiParams } from './web-api/utils';

type ApiItem = (id: string, params?: ApiParams) => Promise<any> | null;

interface TwitterApi {
    init: () => Promise<void> | void;
    getUser: ApiItem;
    getUserTweets: ApiItem;
    getUserTweetsAndReplies: ApiItem;
    getUserMedia: ApiItem;
    getUserLikes: ApiItem;
    getUserTweet: ApiItem;
    getSearch: ApiItem;
    getList: ApiItem;
    getHomeTimeline: ApiItem;
    getHomeLatestTimeline: ApiItem;
}

const unconfiguredApi: TwitterApi = {
    init: () => {
        throw new ConfigNotFoundError('Twitter API is not configured');
    },
    getUser: () => null,
    getUserTweets: () => null,
    getUserTweetsAndReplies: () => null,
    getUserMedia: () => null,
    getUserLikes: () => null,
    getUserTweet: () => null,
    getSearch: () => null,
    getList: () => null,
    getHomeTimeline: () => null,
    getHomeLatestTimeline: () => null,
};

// Chosen on every call rather than at startup, as the credentials may come with the request (see `@/middleware/request-config`)
const selectApi = (): TwitterApi => {
    if (config.twitter.thirdPartyApi || config.twitter.authToken) {
        return webApi;
    }
    if (config.twitter.consumerKey && config.twitter.consumerSecret) {
        return devApi;
    }
    return unconfiguredApi;
};

const api = Object.fromEntries(Object.keys(unconfiguredApi).map((method) => [method, (...args: unknown[]) => selectApi()[method](...args)])) as unknown as TwitterApi;

export default api;
