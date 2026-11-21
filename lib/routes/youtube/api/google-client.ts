import { auth as googleAuth, youtube as googleYoutube } from '@googleapis/youtube';

import { config } from '@/config';
import { isWorker } from '@/utils/is-worker';

const { OAuth2 } = googleAuth;
const workerFetch: typeof fetch = (input, init) => fetch(input, init);
const transportOptions = isWorker ? { fetchImplementation: workerFetch } : {};

let count = 0;
const youtube = {};
if (config.youtube && config.youtube.key) {
    const keys = config.youtube.key.split(',');

    for (const [index, key] of keys.entries()) {
        if (!key) {
            continue;
        }

        youtube[index] = googleYoutube({
            version: 'v3',
            auth: key,
            ...transportOptions,
        });
        count = index + 1;
    }
}

// Reasons Google attaches to a 403 when the project is out of quota. gaxios keeps the
// raw error body under response.data; googleapis-common also copies `errors` onto the error.
const quotaErrorReasons = new Set(['quotaExceeded', 'dailyLimitExceeded', 'rateLimitExceeded', 'userRateLimitExceeded']);
const isQuotaError = (error) => {
    const errors = error?.response?.data?.error?.errors ?? error?.errors;
    return Array.isArray(errors) && errors.some((e) => quotaErrorReasons.has(e?.reason));
};

let index = -1;
const exec = async (func) => {
    let result;
    let lastError;
    for (let i = 0; i < count; i++) {
        index++;
        try {
            // eslint-disable-next-line no-await-in-loop
            result = await func(youtube[index % count]);
            break;
        } catch (error) {
            lastError = error;
        }
    }
    // Every key failed. When that is because the quota is gone, returning undefined only
    // moves the failure to the caller's `.data` access ("Cannot read properties of
    // undefined"), which hides the actual cause. Surface it instead. Other failures keep
    // returning undefined so callers that treat it as "not found" behave as before.
    if (result === undefined && isQuotaError(lastError)) {
        throw lastError;
    }
    return result;
};

let youtubeOAuth2Client;
if (config.youtube && config.youtube.clientId && config.youtube.clientSecret && config.youtube.refreshToken) {
    youtubeOAuth2Client = new OAuth2({
        clientId: config.youtube.clientId,
        clientSecret: config.youtube.clientSecret,
        redirectUri: 'https://developers.google.com/oauthplayground',
        transporterOptions: transportOptions,
    });
    youtubeOAuth2Client.setCredentials({ refresh_token: config.youtube.refreshToken });
}

export { exec, youtubeOAuth2Client };
