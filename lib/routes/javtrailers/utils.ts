import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';
import type { Video } from './types';

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

export const puppeteerFetch = async (url: string, browser) => {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(headers);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    logger.http(`Requesting ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const apiResponse = await page.evaluate(() => document.body.textContent || '');
    const response = JSON.parse(apiResponse);
    await page.close();

    return response;
};

export const getItem = async (item, browser) => {
    const response = await puppeteerFetch(`${baseUrl}/api/video/${item.contentId}`, browser);

    const videoInfo: Video = response.video;
    videoInfo.gallery = hdGallery(videoInfo.gallery);

    item.description = renderDescription(videoInfo);
    item.author = videoInfo.casts.map((cast) => `${cast.name} ${cast.jpName}`).join(', ');
    item.category = videoInfo.categories.map((category) => `${category.name}／${category.jpName}／${category.zhName}`);

    return item;
};
