import got from '@/utils/got';
import { config } from '@/config';
import cache from '@/utils/cache';
import { getFilteredLanguages } from './_profile';

const mangaMetaBaseUrl = 'https://api.mangadex.org/manga/';
const mainCoverMetaBaseUrl = 'https://api.mangadex.org/cover/';
const coverBaseUrl = 'https://uploads.mangadex.org/covers/';
const chapterBaseUrl = 'https://mangadex.org/chapter/';

/**
 * Get the first value that matches the keys in the source object
 *
 * @param source the source object
 * @param keys the keys to search
 * @returns the first match value, or the first value as fallback
 */
const firstMatch = (source: Map<string, string> | object, keys: string[]) => {
    for (const key of keys) {
        const value = source instanceof Map ? source.get(key) : source[key];
        if (value) {
            return value;
        }
    }
    return Object.values(source)[0];
};

function toQueryString(params: Record<string, any>): string {
    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Set)) {
            for (const [subKey, subValue] of Object.entries(value)) {
                if (typeof subValue === 'string' || typeof subValue === 'number' || typeof subValue === 'boolean') {
                    queryParts.push(`${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(subValue)}`);
                }
            }
        } else if (Array.isArray(value) || value instanceof Set) {
            for (const item of value) {
                queryParts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
            }
        } else {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }

    if (queryParts.length === 0) {
        return '';
    }
    return '?' + queryParts.join('&');
}

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

    const title = firstMatch(titles, languages);

    const description = firstMatch(rawMangaMeta.attributes.description, languages);

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

const getMangaChapters = async (id: string, lang?: string) => {
    const languages = new Set([lang, ...(await getFilteredLanguages())].filter(Boolean));

    const url = `${mangaMetaBaseUrl}${id}/feed${toQueryString({
        order: {
            publishAt: 'desc',
        },
        translatedLanguage: languages,
    })}`;

    const chapters = (await cache.tryGet(`mangadex:manga-chapters:${id}`, async () => {
        const { data } = await got.get(url);

        if (data.result === 'error') {
            throw new Error(data.errors[0].detail);
        }

        return data.data;
    })) as any;

    if (!chapters) {
        return { count: 0 };
    }

    return {
        count: chapters.length,
        chapters: chapters.map((chapter) => ({
            title: [chapter.attributes.volume ? `Vol. ${chapter.attributes.volume}` : null, chapter.attributes.chapter ? `Ch. ${chapter.attributes.chapter}` : null, chapter.attributes.title].filter(Boolean).join(' '),
            link: `${chapterBaseUrl}${chapter.id}`,
            pubDate: new Date(chapter.attributes.publishAt),
        })),
    };
};

export { getMangaMeta, getMangaChapters };
