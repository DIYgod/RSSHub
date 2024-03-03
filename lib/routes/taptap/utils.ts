// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import * as path from 'node:path';
import { art } from '@/utils/render';

// Please do not change %26 to &
const X_UA = (lang = 'zh_CN') => `X-UA=V=1%26PN=WebApp%26VN=0.1.0%26LANG=${lang}%26PLT=PC`;

const getRootUrl = (isIntl = false) => (isIntl ? 'https://www.taptap.io' : 'https://www.taptap.com');

const appDetail = async (appId, lang = 'zh_CN', isIntl = false) => {
    const { data } = await got(`${getRootUrl(isIntl)}/webapiv2/group/v1/detail?app_id=${appId}&${X_UA(lang)}`, {
        headers: {
            Referer: `${getRootUrl(isIntl)}/app/${appId}`,
        },
    });
    return data.data;
};

const imagePost = (images) =>
    art(path.join(__dirname, 'templates/imagePost.art'), {
        images,
    });

const topicPost = async (appId, topicId, lang = 'zh_CN') => {
    const res = await got(`${getRootUrl(false)}/webapiv2/topic/v1/detail?id=${topicId}&${X_UA(lang)}`, {
        headers: {
            Referer: `${getRootUrl(false)}/app/${appId}`,
        },
    });
    const $ = load(res.data.data.first_post.contents.text, null, false);
    $('img').each((_, e) => {
        e = $(e);
        e.attr('src', e.attr('data-origin-url'));
        e.attr('referrerpolicy', 'no-referrer');
        e.removeAttr('data-origin-url');
    });
    return $.html();
};

const videoPost = (video) =>
    art(path.join(__dirname, 'templates/videoPost.art'), {
        intro: video?.intro?.text,
        previewUrl: video?.video_resource.preview_animation.original_url,
    });

module.exports = {
    getRootUrl,
    X_UA,
    appDetail,
    imagePost,
    topicPost,
    videoPost,
};
