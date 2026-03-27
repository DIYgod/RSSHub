import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { Detail } from './types';

const X_UA = (lang = 'zh_CN') => `X-UA=${encodeURIComponent(`V=1&PN=WebApp&VN=0.1.0&LANG=${lang}&PLT=PC`)}`;

const getRootUrl = (isIntl = false) => (isIntl ? 'https://www.taptap.io' : 'https://www.taptap.cn');

const appDetail = (appId, lang = 'zh_CN', isIntl = false) =>
    cache.tryGet(`taptap:appDetail:${appId}:${lang}:${isIntl}`, async () => {
        const data = await ofetch(`${getRootUrl(isIntl)}/webapiv2/group/v1/detail?app_id=${appId}&${X_UA(lang)}`, {
            headers: {
                Referer: `${getRootUrl(isIntl)}/app/${appId}`,
            },
        });
        return data.data;
    }) as Promise<Detail>;

const imagePost = (images) =>
    renderToString(
        <>
            {images.map((image) => (
                <img src={image.original_url || image.url} />
            ))}
        </>
    );

const topicPost = async (appId, topicId, lang = 'zh_CN') => {
    const res = await ofetch(`${getRootUrl(false)}/webapiv2/topic/v1/detail?id=${topicId}&${X_UA(lang)}`, {
        headers: {
            Referer: `${getRootUrl(false)}/app/${appId}`,
        },
    });
    const $ = load(res.data.first_post.contents.text, null, false);
    $('img').each((_, e) => {
        const $e = $(e);
        $e.attr('src', $e.attr('data-origin-url'));
        $e.removeAttr('data-origin-url');
    });
    return $.html();
};

const videoPost = (video) =>
    renderToString(
        <>
            <p>Preview</p>
            <p>
                <img src={video.thumbnail.original_url || video.thumbnail.url} />
            </p>
        </>
    );

export { appDetail, getRootUrl, imagePost, topicPost, videoPost, X_UA };
