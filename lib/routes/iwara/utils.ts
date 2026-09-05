import { getPlaywrightPage, type Page } from '@/utils/playwright';

export const rootUrl = 'https://www.iwara.tv';
export const apiRootUrl = 'https://api.iwara.tv';
export const imageRootUrl = 'https://i.iwara.tv';

export const getIwaraPage = () =>
    getPlaywrightPage(rootUrl, {
        closeTimeout: 90 * 1000,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const resourceType = route.request().resourceType();
                ['document', 'script', 'xhr', 'fetch'].includes(resourceType) ? route.continue() : route.abort();
            });
        },
        gotoConfig: {
            waitUntil: 'domcontentloaded',
        },
    });

export const fetchJsonInPage = (page: Page, url: string) =>
    page.evaluate(async (u) => {
        const res = await fetch(u);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    }, url);

export const typeMap = {
    video: 'Videos',
    image: 'Images',
};

export const parseThumbnail = (type: 'video' | 'image', item: any) => {
    if (type === 'image') {
        const thumbnail = item.thumbnail || item.file;
        return thumbnail ? `<img src="${imageRootUrl}/image/original/${thumbnail.id}/${thumbnail.name}">` : '';
    }

    if (item.embedUrl === null) {
        return item.file ? `<img src="${imageRootUrl}/image/original/${item.file.id}/thumbnail-${String(item.thumbnail).padStart(2, '0')}.jpg">` : '';
    }

    // regex borrowed from https://stackoverflow.com/a/3726073
    const match = /https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]*)(?:&(?:amp;)?[\w=?]*)?/.exec(item.embedUrl);
    if (match) {
        return `<img src="${imageRootUrl}/image/embed/original/youtube/${match[1]}">`;
    }

    return '';
};
