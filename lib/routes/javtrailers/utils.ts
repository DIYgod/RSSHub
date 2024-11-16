import { Video } from './types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

export const baseUrl = 'https://javtrailers.com';
export const headers = {
    Authorization: 'AELAbPQCh_fifd93wMvf_kxMD_fqkUAVf@BVgb2!md@TNW8bUEopFExyGCoKRcZX',
};

export const hdGallery = (gallery) =>
    gallery.map((item) => {
        if (item.startsWith('https://pics.dmm.co.jp/')) {
            return item.replace(/-(\d+)\.jpg$/, 'jp-$1.jpg');
        } else if (item.startsWith('https://image.mgstage.com/')) {
            return item.replace(/cap_t1_/, 'cap_e_');
        }
        return item;
    });

export const parseList = (videos) =>
    videos.map((item) => ({
        title: `${item.dvdId} ${item.title}`,
        link: `${baseUrl}/video/${item.contentId}`,
        pubDate: parseDate(item.releaseDate),
        contentId: item.contentId,
    }));

export const getItem = async (item) => {
    const response = await ofetch(`${baseUrl}/api/video/${item.contentId}`, {
        headers,
    });

    const videoInfo: Video = response.video;
    videoInfo.gallery = hdGallery(videoInfo.gallery);

    item.description = art(path.join(__dirname, 'templates/description.art'), {
        videoInfo,
    });
    item.author = videoInfo.casts.map((cast) => `${cast.name} ${cast.jpName}`).join(', ');
    item.category = videoInfo.categories.map((category) => `${category.name}／${category.jpName}／${category.zhName}`);

    return item;
};
