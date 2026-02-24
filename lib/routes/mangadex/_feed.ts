import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';

import constants from './_constants';
import { getFilteredLanguages } from './_profile';
import { firstMatch, toQueryString } from './_utils';

/**
 * Retrieves the title, description, and cover of a manga.
 *
 * @author chrisis58, vzz64
 * @param id manga id
 * @param lang language(s), absent for default
 * @param needCover whether to fetch cover
 * @returns title, description, and cover of the manga
 */
const getMangaMeta = async (id: string, needCover: boolean = true, lang?: string | string[]) => {
    const includes = needCover ? ['cover_art'] : [];

    const rawMangaMeta = (await cache.tryGet(`mangadex:manga-meta:${id}`, async () => {
        const { data } = await got.get(
            `${constants.API.MANGA_META}${id}${toQueryString({
                includes,
            })}`
        );

        if (data.result === 'error') {
            throw new Error(data.errors[0].detail);
        }
        return data.data;
    })) as any;

    const relationships = (rawMangaMeta.relationships || []) as Array<{ type: string; id: string; attributes: any }>;

    const languages = [
        ...(typeof lang === 'string' ? [lang] : lang || []),
        ...(await getFilteredLanguages()),
        rawMangaMeta.attributes.originalLanguage, // fallback to original language
    ].filter(Boolean);

    // combine title and altTitles
    const titles = {
        ...rawMangaMeta.attributes.title,
        ...Object.fromEntries(rawMangaMeta.attributes.altTitles.flatMap((element) => Object.entries(element))),
    };

    const title = firstMatch(titles, languages) as string;

    const description = firstMatch(rawMangaMeta.attributes.description, languages) as string;

    if (!needCover) {
        return { title, description };
    }

    const coverFilename = relationships.find((relationship) => relationship.type === 'cover_art')?.attributes.fileName + '.512.jpg';
    const cover = `${constants.API.COVER_IMAGE}${id}/${coverFilename}`;

    return { title, description, cover };
};

/**
 * Retrieves the title, description, and cover of multiple manga.
 * TODO: Retrieve page by page to avoid meeting the length limit of URL.
 *
 * @param ids manga ids
 * @param needCover whether to fetch cover
 * @param lang language(s), absent for default
 * @returns a map of manga id to title, description, and cover
 * @usage const mangaMetaMap = await getMangaMetaByIds(['f98660a1-d2e2-461c-960d-7bd13df8b76d']);
 */
export async function getMangaMetaByIds(ids: string[], needCover: boolean = true, lang?: string | string[]): Promise<Map<string, { id: string; title: string; description: string; cover?: string }>> {
    const deDuplidatedIds = [...new Set(ids)].toSorted();
    const includes = needCover ? ['cover_art'] : [];

    const rawMangaMetas = (await cache.tryGet(
        `mangadex:manga-meta:${md5(deDuplidatedIds.join(''))}`, // shorten the key
        async () => {
            const { data } = await got.get(
                constants.API.MANGA_META.slice(0, -1) +
                    toQueryString({
                        ids: deDuplidatedIds,
                        includes,
                        limit: deDuplidatedIds.length,
                    })
            );

            if (data.result === 'error') {
                throw new Error('Failed to retrieve manga meta from MangaDex API.');
            }
            return data.data;
        }
    )) as any[];

    const languages = [...(typeof lang === 'string' ? [lang] : lang || []), ...(await getFilteredLanguages())].filter(Boolean);

    const map = new Map<string, { id: string; title: string; description: string; cover?: string }>();
    for (const rawMangaMeta of rawMangaMetas) {
        const id = rawMangaMeta.id;

        const titles = {
            ...rawMangaMeta.attributes.title,
            ...Object.fromEntries(rawMangaMeta.attributes.altTitles.flatMap((element) => Object.entries(element))),
        };

        const title = firstMatch(titles, [...languages, rawMangaMeta.attributes.originalLanguage]) as string;

        const description = firstMatch(rawMangaMeta.attributes.description, languages) as string;

        let cover: string | undefined;
        let manga = { id, title, description, cover };

        if (needCover) {
            const coverFilename = rawMangaMeta.relationships.find((relationship) => relationship.type === 'cover_art')?.attributes.fileName;
            if (coverFilename) {
                cover = `${constants.API.COVER_IMAGE}${rawMangaMeta.id}/${coverFilename}.512.jpg`;
                manga = { ...manga, cover };
            }
        }

        map.set(id, manga);
    }
    return map;
}

/**
 * Retrieves the chapters of a manga.
 *
 * @author chrisis58, vzz64
 * @param id manga id
 * @param lang language(s), absent for default
 * @returns chapters of the manga
 */
const getMangaChapters = async (id: string, lang?: string | string[], limit?: number) => {
    const languages = new Set([...(typeof lang === 'string' ? [lang] : lang || []), ...(await getFilteredLanguages())].filter(Boolean));

    const url = `${constants.API.MANGA_META}${id}/feed${toQueryString({
        order: {
            publishAt: 'desc',
        },
        limit: limit || 100,
        translatedLanguage: languages,
    })}`;

    const chapters = (await cache.tryGet(
        `mangadex:manga-chapters:${id}`,
        async () => {
            const { data } = await got.get(url);

            if (data.result === 'error') {
                throw new Error(data.errors[0].detail);
            }

            return data.data;
        },
        config.cache.routeExpire,
        false
    )) as any;

    if (!chapters) {
        return [];
    }

    return chapters.map((chapter) => ({
        title: [chapter.attributes.volume ? `Vol. ${chapter.attributes.volume}` : null, chapter.attributes.chapter ? `Ch. ${chapter.attributes.chapter}` : null, chapter.attributes.title].filter(Boolean).join(' '),
        link: `${constants.API.MANGA_CHAPTERS}${chapter.id}`,
        pubDate: new Date(chapter.attributes.publishAt),
    })) as Array<{ title: string; link: string; pubDate: Date }>;
};

/**
 * Retrieves the title, description, cover, and chapters of a manga.
 * Cominbation of getMangaMeta and getMangaChapters.
 *
 * @param id manga id
 * @param lang language, absent for default
 * @returns title, description, cover, and chapters of the manga
 */
const getMangaDetails = async (id: string, needCover: boolean = true, lang?: string | string[]) => {
    const [meta, chapters] = await Promise.all([getMangaMeta(id, needCover, lang), getMangaChapters(id, lang)]);
    return { ...meta, chapters };
};

export { getMangaChapters, getMangaDetails, getMangaMeta };
