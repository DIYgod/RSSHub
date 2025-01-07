import got from '@/utils/got';
import cache from '@/utils/cache';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

import constants from './_constants';

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
 * @returns {Promise<string>} A promise that resolves to the access token.
 */
const getToken = () => {
    if (!config.mangadex.clientId || !config.mangadex.clientSecret) {
        throw new ConfigNotFoundError('Cannot get access token since MangaDex client ID or secret is not set.');
    }

    return cache.tryGet(
        'mangadex:access-token',
        async () => {
            const refreshToken = await getRefreshToken();

            const response = await got.post(constants.API.TOEKN, {
                headers: {
                    'User-Agent': config.trueUA,
                },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: config.mangadex.clientId,
                    client_secret: config.mangadex.clientSecret,
                },
            });

            const accessToken = response?.data?.access_token;
            if (!accessToken) {
                throw new Error('Failed to retrieve access token from MangaDex API.');
            }
            return accessToken;
        },
        15 * 60 - 10, // access token expires in 15 minutes, refresh 10 seconds earlier
        false
    );
};

const getRefreshToken = async () => {
    if (config.mangadex.refreshToken) {
        return config.mangadex.refreshToken;
    }

    if (!config.mangadex.username || !config.mangadex.password) {
        throw new ConfigNotFoundError('Cannot get refresh token since MangaDex username or password is not set');
    }

    const response = await got.post(constants.API.TOEKN, {
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

    if (!refreshToken) {
        throw new Error('Failed to retrieve refresh token from MangaDex API.');
    }

    config.mangadex.refreshToken = refreshToken; // cache the refresh token
    return refreshToken;
};

export default getToken;
