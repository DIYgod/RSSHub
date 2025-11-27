import path from 'node:path';

import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';

const indexUrl = 'http://mei8.vip/';

const getOriginUrl = async () =>
    await cache.tryGet('jpxgmn:originUrl', async () => {
        const response = await got(indexUrl);
        const $ = load(response.data);
        const entries = $('ul > li > span');
        return 'http://' + $(entries[Math.floor(Math.random() * entries.length)]).text();
    });
const getImages = ($articleContent) =>
    $articleContent('article > p img')
        .toArray()
        .map((img) => $articleContent(img).attr('src'));

const getArticleDesc = async (articleUrl) => {
    const response = await got(articleUrl);
    const $content = load(response.data);
    let pageCnt = $content('div.pagination:first ul a').length - 1;
    if (pageCnt === -1) {
        pageCnt = 1;
    }
    const images = getImages($content);
    const otherImages = await Promise.all(
        [...Array.from({ length: pageCnt - 1 }).keys()].map(async (pageIndex) => {
            const pageUrl = articleUrl.replace('.html', `_${pageIndex + 1}.html`);
            const pageResponse = await got(pageUrl);
            return getImages(load(pageResponse.data));
        })
    );
    return art(path.join(__dirname, 'templates/description.art'), {
        images: [...images, ...otherImages.flat()],
    });
};

export { getArticleDesc, getOriginUrl };
