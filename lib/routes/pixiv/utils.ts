// @ts-nocheck
import { config } from '@/config';

module.exports = {
    getImgs(illust) {
        const images = [];
        if (illust.meta_pages?.length) {
            for (const page of illust.meta_pages) {
                const original = page.image_urls.original.replace('https://i.pximg.net', config.pixiv.imgProxy);
                images.push(`<p><img src="${original}"/></p>`);
            }
        } else if (illust.meta_single_page.original_image_url) {
            const original = illust.meta_single_page.original_image_url.replace('https://i.pximg.net', config.pixiv.imgProxy);
            images.push(`<p><img src="${original}"/></p>`);
        }
        return images;
    },
};
