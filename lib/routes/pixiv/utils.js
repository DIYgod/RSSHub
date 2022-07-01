const config = require('@/config').value;

module.exports = {
    getImgs(illust) {
        const images = [];
        if (illust.meta_pages?.length) {
            for (let i = 0; i < illust.meta_pages.length; i++) {
                const original = illust.meta_pages[i].image_urls.original.replace('https://i.pximg.net', config.pixiv.imgProxy);
                images.push(`<p><img src="${original}"/></p>`);
            }
        } else if (illust.meta_single_page.original_image_url) {
            const original = illust.meta_single_page.original_image_url.replace('https://i.pximg.net', config.pixiv.imgProxy);
            images.push(`<p><img src="${original}"/></p>`);
        }
        return images;
    },
};
