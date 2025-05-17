import got from '@/utils/got';
import cache from '@/utils/cache';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

import constants from './_constants';
import { FetchError } from 'ofetch';

/**
 * Retrieves an access token.
 *
 * @important Ensure the request includes a User-Agent header.
 * @throws {ConfigNotFoundError} If the required configuration is missing.
 * The following credentials are mandatory:
 * - `client ID` and `client secret`
 * - One of the following:
 *   - `username` and `password`
 *   - `refresh token`
 * @throws {FetchError} If the request fails.
 * - 400 Bad Request: If the `refresh token` or other credentials are invalid.
 * @returns {Promise<string>} A promise that resolves to the access token.
 */
const getToken = () => {
    if (!config.mangadex.clientId || !config.mangadex.clientSecret) {
        throw new ConfigNotFoundError('Cannot get access token since MangaDex client ID or secret is not set.');
    }

    return cache.tryGet(
        'mangadex:access-token',
        async () => {
            if (!config.mangadex.refreshToken) {
                return getAccessTokenByUserCredentials();
            }

            try {
                return await getAccessTokenByRefreshToken();
            } catch (error) {
                if (error instanceof FetchError && error.statusCode === 400) {
                    // If the refresh token is invalid, try to get a new one with the user credentials
                    return getAccessTokenByUserCredentials();
                }
                throw error;
            }
        },
        constants.TOKEN_EXPIRE,
        false
    );
};

const getAccessTokenByUserCredentials = async () => {
    if (!config.mangadex.clientId || !config.mangadex.clientSecret) {
        throw new ConfigNotFoundError('Cannot get access token since MangaDex client ID or secret is not set.');
    }

    if (!config.mangadex.username || !config.mangadex.password) {
        throw new ConfigNotFoundError('Cannot get refresh token since MangaDex username or password is not set');
    }

    const response = await got.post(constants.API.TOKEN, {
        headers: {
            'User-Agent': config.trueUA,
        },
        form: {
            grant_type: 'password',
            username: config.mangadex.username,
            password: config.mangadex.password,
            client_id: config.mangadex.clientId,
            client_secret: config.mangadex.clientSecret,
        },
    });

    const refreshToken = response?.data?.refresh_token;
    const accessToken = response?.data?.access_token;

    if (!refreshToken || !accessToken) {
        throw new Error('Failed to retrieve refresh token from MangaDex API.');
    }

    config.mangadex.refreshToken = refreshToken; // cache the refresh token
    return accessToken;
};

const getAccessTokenByRefreshToken = async () => {
    if (!config.mangadex.clientId || !config.mangadex.clientSecret) {
        throw new ConfigNotFoundError('Cannot get access token since MangaDex client ID or secret is not set.');
    }

    if (!config.mangadex.refreshToken) {
        throw new ConfigNotFoundError('Cannot get access token since MangaDex refresh token is not set.');
    }

    const response = await got.post(constants.API.TOKEN, {
        headers: {
            'User-Agent': config.trueUA,
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: config.mangadex.refreshToken,
            client_id: config.mangadex.clientId,
            client_secret: config.mangadex.clientSecret,
        },
    });

    const accessToken = response?.data?.access_token;
    if (!accessToken) {
        throw new Error('Failed to retrieve access token from MangaDex API.');
    }
    return accessToken;
};

export default getToken;
