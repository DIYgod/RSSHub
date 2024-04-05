import mobileApi from './mobile-api/api';
import webApi from './web-api/api';
import { config } from '@/config';

const enableMobileApi = config.twitter.username && config.twitter.password;
const enableWebApi = config.twitter.cookie;

type ApiItem = (id: string, params?: Record<string, any>) => Promise<Record<string, any>> | Record<string, any> | null;
let api: {
    init: () => void;
    getUser: ApiItem;
    getUserTweets: ApiItem;
    getUserTweetsAndReplies: ApiItem;
    getUserMedia: ApiItem;
    getUserLikes: ApiItem;
    getUserTweet: ApiItem;
    getSearch: ApiItem;
    getList: ApiItem;
    getHomeTimeline: ApiItem;
} = {
    init: () => {
        throw new Error('Twitter API is not configured');
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
};

if (enableWebApi) {
    api = webApi;
} else if (enableMobileApi) {
    api = mobileApi;
}

export default api;
