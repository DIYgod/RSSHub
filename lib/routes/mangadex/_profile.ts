import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';
import got from '@/utils/got';

import getToken from './_access';
import constants from './_constants';

/**
 * @see https://api.mangadex.org/docs/redoc.html#tag/Settings/operation/get-settings
 */
type UserSettings = {
    userPreferences: {
        filteredLanguages: string[];
    };
};

const getSetting = async () => {
    const accessToken = await getToken();

    return cache.tryGet<UserSettings>(
        'mangadex:settings',
        async () => {
            const response = await got.get(constants.API.SETTING, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': config.trueUA,
                },
            });

            const setting = response?.data?.settings;
            if (!setting) {
                throw new Error('Failed to retrieve user settings from MangaDex API.');
            }

            return setting;
        },
        config.cache.contentExpire,
        false
    );
};

const getFilteredLanguages = async (ingoreConfigNotFountError: boolean = true) => {
    try {
        const settings = await getSetting();
        return settings.userPreferences.filteredLanguages;
    } catch (error) {
        if (ingoreConfigNotFountError && error instanceof ConfigNotFoundError) {
            return [];
        }
        throw error;
    }
};

export default getSetting;
export { getFilteredLanguages };
