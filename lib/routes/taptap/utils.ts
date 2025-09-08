import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { Detail } from './types';

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
    art(path.join(__dirname, 'templates/imagePost.art'), {
        images,
    });

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
    art(path.join(__dirname, 'templates/videoPost.art'), {
        previewUrl: video.thumbnail.original_url || video.thumbnail.url,
    });

export { getRootUrl, X_UA, appDetail, imagePost, topicPost, videoPost };
