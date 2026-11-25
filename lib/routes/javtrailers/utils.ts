import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';
import type { Video } from './types';

export const baseUrl = 'https://javtrailers.com';

interface ListingData {
    videos: Video[];
    cast: Video['casts'][number] & { castWiki?: { description: string } };
    category: Video['categories'][number];
    studio: Video['studio'] & { hotDvdIds?: string[] };
}

// Values in a Nuxt payload; `undefined` comes from the -1 reference.
type PayloadValue = string | number | boolean | null | undefined | PayloadValue[] | { [key: string]: PayloadValue };

const decodePayload = (payload: PayloadValue[], index: number): PayloadValue => {
    if (index === -1) {
        return undefined;
    }
    const value = payload[index];
    if (Array.isArray(value)) {
        if (typeof value[0] === 'string' && ['Reactive', 'ShallowReactive', 'Ref', 'ShallowRef'].includes(value[0]) && typeof value[1] === 'number') {
            return decodePayload(payload, value[1]);
        }
        return value.map((reference) => (typeof reference === 'number' ? decodePayload(payload, reference) : undefined));
    }
    if (value && typeof value === 'object') {
        const result: { [key: string]: PayloadValue } = {};
        for (const [key, reference] of Object.entries(value)) {
            if (typeof reference !== 'number') {
                throw new TypeError('The public page contains an unsupported payload reference.');
            }
            result[key] = decodePayload(payload, reference);
        }
        return result;
    }
    return value;
};

const getPageData = async <T>(url: string, key: 'cast' | 'category' | 'studio' | 'video'): Promise<T> => {
    const html = await ofetch(url);
    const nuxtData = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)<\/script>/s)?.[1];
    if (!nuxtData) {
        throw new Error(`The public page ${url} no longer contains Nuxt data.`);
    }
    const payload: PayloadValue[] = JSON.parse(nuxtData);
    const index = payload.findIndex((entry) => entry && typeof entry === 'object' && !Array.isArray(entry) && Object.hasOwn(entry, key) && (key === 'video' || Object.hasOwn(entry, 'videos')));
    if (index === -1) {
        throw new Error(`The public page ${url} no longer contains ${key} data.`);
    }
    return decodePayload(payload, index) as T;
};

export const getList = (url: string, key: 'cast' | 'category' | 'studio') => getPageData<ListingData>(url, key);

const hdGallery = (gallery) =>
    gallery.map((item) => {
        if (item.startsWith('https://pics.dmm.co.jp/')) {
            return item.replace(/-(\d+)\.jpg$/, 'jp-$1.jpg');
        }
        if (item.startsWith('https://image.mgstage.com/')) {
            return item.replace(/cap_t1_/, 'cap_e_');
        }
        return item;
    });

export const parseList = (videos: Video[]) =>
    videos.map((item) => ({
        title: `${item.dvdId} ${item.title}`,
        link: `${baseUrl}/video/${item.contentId}`,
        pubDate: parseDate(item.releaseDate),
        contentId: item.contentId,
    }));

export const getItem = async (item) => {
    const response = await getPageData<{ video: Video }>(item.link, 'video');

    const videoInfo: Video = response.video;
    videoInfo.gallery = hdGallery(videoInfo.gallery);

    return {
        description: renderDescription(videoInfo),
        author: videoInfo.casts.map((cast) => `${cast.name} ${cast.jpName}`).join(', '),
        category: videoInfo.categories.map((category) => `${category.name}／${category.jpName}／${category.zhName}`),
    };
};
