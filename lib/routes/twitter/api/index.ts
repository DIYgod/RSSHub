import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import logger from '@/utils/logger';

import devApi from './developer-api/api';
import loggedOutApi from './logged-out-api/api';
// import mobileApi from './mobile-api/api';
import webApi from './web-api/api';
import type { ApiParams } from './web-api/utils';

const enableThirdPartyApi = config.twitter.thirdPartyApi;
// const enableMobileApi = config.twitter.username && config.twitter.password;
const enableWebApi = config.twitter.authToken;
const enableDeveloperApi = config.twitter.consumerKey && config.twitter.consumerSecret;

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

const getConfiguredApi = (): TwitterApi | undefined => {
    if (enableThirdPartyApi || enableWebApi) {
        return webApi;
    }
    if (enableDeveloperApi) {
        return devApi;
    }
    return;
};

const configuredApi = getConfiguredApi();

export const hasCredentials = configuredApi !== undefined;

const notConfigured = () => {
    throw new ConfigNotFoundError('Twitter API is not configured');
};

/** The configured API alone, for requests that the pages x.com shows logged-out visitors cannot serve */
export const credentialsApi: TwitterApi = configuredApi ?? {
    init: notConfigured,
    getUser: notConfigured,
    getUserTweets: notConfigured,
    getUserTweetsAndReplies: notConfigured,
    getUserMedia: notConfigured,
    getUserLikes: notConfigured,
    getUserTweet: notConfigured,
    getSearch: notConfigured,
    getList: notConfigured,
    getHomeTimeline: notConfigured,
    getHomeLatestTimeline: notConfigured,
};

/**
 * Reads the pages x.com shows logged-out visitors first, which needs no credentials, and uses the configured API only
 * when those pages cannot serve the request: when reading them fails, or when they have nothing for it
 */
const preferLoggedOut =
    (method: 'getUser' | 'getUserTweets' | 'getUserTweet', readLoggedOut: ApiItem): ApiItem =>
    async (id, params) => {
        try {
            const result = await readLoggedOut(id, params);
            // An account without original posts may still have reposts that the configured API returns
            if (!configuredApi || !Array.isArray(result) || result.length > 0) {
                return result;
            }
            logger.debug(`twitter: logged-out ${method} of ${id} found nothing, using the configured API`);
        } catch (error) {
            if (!configuredApi) {
                throw error;
            }
            logger.debug(`twitter: logged-out ${method} of ${id} failed, using the configured API: ${error}`);
        }
        return configuredApi[method](id, params);
    };

const api: TwitterApi = {
    ...credentialsApi,
    init: async () => {
        await configuredApi?.init();
    },
    getUser: preferLoggedOut('getUser', loggedOutApi.getUser),
    getUserTweets: preferLoggedOut('getUserTweets', loggedOutApi.getUserTweets),
    getUserTweet: preferLoggedOut('getUserTweet', loggedOutApi.getUserTweet),
};

export default api;
