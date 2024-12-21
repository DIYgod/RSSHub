import got from '@/utils/got';
import { config } from '@/config';
import cache from '@/utils/cache';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import getToken from './_access';

const settingUrl = 'https://api.mangadex.org/settings';

const getSetting = async () => {
    const accessToken = await getToken();

    return cache.tryGet(
        'mangadex:settings',
        async () => {
            const response = await got.get(settingUrl, {
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
        config.cache.contentExpire
    );
};

const getFilteredLanguages = async (ingoreConfigNotFountError: boolean = true) => {
    if (config.mangadex.filteredLanguages) {
        return config.mangadex.filteredLanguages;
    }

    try {
        const settings = (await getSetting()) as any;
        return settings.userPreferences.filteredLanguages as string[];
    } catch (error) {
        if (ingoreConfigNotFountError && error instanceof ConfigNotFoundError) {
            return [];
        }
        throw error;
    }
};

export default getSetting;
export { getFilteredLanguages };
