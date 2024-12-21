import got from '@/utils/got';
import { config } from '@/config';
import cache from '@/utils/cache';
import { getFilteredLanguages } from './_profile';

const mangaMetaBaseUrl = 'https://api.mangadex.org/manga/';
const mainCoverMetaBaseUrl = 'https://api.mangadex.org/cover/';
const coverBaseUrl = 'https://uploads.mangadex.org/covers/';

const firstMatch = (source: Map<string, string> | object, keys: string[]) => {
    for (const key of keys) {
        const value = source instanceof Map ? source.get(key) : source[key];
        if (value) {
            return value;
        }
    }
    return null;
};

const getMangaMeta = async (id: string, lang?: string, needCover: boolean = false) => {
    const rawMangaMeta = (await cache.tryGet(
        `mangadex:manga-meta:${id}`,
        async () => {
            const { data } = await got.get(`${mangaMetaBaseUrl}${id}`);

            if (data.result === 'error') {
                throw new Error(data.errors[0].detail);
            }
            return data.data;
        },
        config.cache.contentExpire
    )) as any;

    const languages = [
        lang,
        ...(await getFilteredLanguages()),
        rawMangaMeta.attributes.originalLanguage, // fallback to original language
    ].filter(Boolean);

    // combine title and altTitles
    const titles = {
        ...rawMangaMeta.attributes.title,
        ...Object.fromEntries(rawMangaMeta.attributes.altTitles.flatMap((element) => Object.entries(element))),
    };

    const title = firstMatch(titles, languages) || Object.values(rawMangaMeta.attributes.title)[0];

    const description = firstMatch(rawMangaMeta.attributes.description, languages) || Object.values(rawMangaMeta.attributes.description)[0];

    if (!needCover) {
        return { title, description };
    }

    const coverId = rawMangaMeta.relationships.find((relationship) => relationship.type === 'cover_art')?.id;
    if (coverId) {
        const coverFilename = await cache.tryGet(
            `mangadex:cover:${coverId}`,
            async () => {
                const { data } = await got.get(`${mainCoverMetaBaseUrl}${coverId}`);
                return data.data.attributes.fileName;
            },
            config.cache.contentExpire
        );
        const cover = `${coverBaseUrl}${id}/${coverFilename}`;
        return { title, description, cover };
    }

    return { title, description };
};

export { getMangaMeta };
