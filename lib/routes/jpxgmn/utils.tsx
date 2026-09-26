import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';

const indexUrl = 'http://mei8.vip/';

const getOriginUrl = async () =>
    await cache.tryGet('jpxgmn:originUrl', async () => {
        // 发布页（mei8.vip）已改为 301 直跳源站：发生跨站重定向时最终地址即源站（Fixes #23202）
        const response = await ofetch.raw(indexUrl);
        if (new URL(response.url).host !== new URL(indexUrl).host) {
            return new URL(response.url).origin;
        }
        const $ = load(response._data);
        const entries = $('ul > li > span');
        if (!entries.length) {
            throw new Error('无法从发布页解析源站地址');
        }
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
        Array.from({ length: pageCnt - 1 })
            .keys()
            .toArray()
            .map(async (pageIndex) => {
                const pageUrl = articleUrl.replace('.html', () => `_${pageIndex + 1}.html`);
                const pageResponse = await got(pageUrl);
                return getImages(load(pageResponse.data));
            })
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
