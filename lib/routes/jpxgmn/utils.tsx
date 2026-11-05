import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';

const indexUrl = 'http://mei8.vip/';

const getOriginUrl = async () =>
    await cache.tryGet('jpxgmn:originUrl', async () => {
        // The publish page now 301-redirects to the source site, so use the final origin.
        const response = await ofetch.raw(indexUrl);
        if (new URL(response.url).host !== new URL(indexUrl).host) {
            return new URL(response.url).origin;
        }
        const $ = load(response._data);
        const entries = $('ul > li > span');
        const origins = entries
            .toArray()
            .map((el) => $(el).text().trim())
            .filter(Boolean);
        if (!origins.length) {
            throw new Error(`No gallery site addresses were found at ${indexUrl}. The source index may have moved or been removed.`);
        }
        return `http://${origins[Math.floor(Math.random() * origins.length)]}`;
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
    const otherImages = await pMap(
        Array.from({ length: pageCnt - 1 }, (_, index) => index),
        async (pageIndex) => {
            const pageUrl = articleUrl.replace('.html', () => `_${pageIndex + 1}.html`);
            const pageResponse = await got(pageUrl);
            return getImages(load(pageResponse.data));
        },
        { concurrency: 3 }
    );
    const allImages = [...images, ...otherImages.flat()];
    return renderToString(
        <>
            {allImages.map((src) => (
                <img src={src} />
            ))}
        </>
    );
};

export { getArticleDesc, getOriginUrl };
