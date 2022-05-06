const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const rootUrl = 'https://www.taptap.com';
// Please do not change %26 to &
const X_UA = (lang = 'zh_CN') => `X-UA=V=1%26PN=WebApp%26VN=0.1.0%26LANG=${lang}%26PLT=PC`;

const appId2GroupId = async (appId, lang = 'zh_CN') => {
    const res = await got(`${rootUrl}/webapiv2/group/v1/detail?app_id=${appId}&${X_UA(lang)}`, {
        headers: {
            Referer: `${rootUrl}/app/${appId}`,
        },
    });
    return res.data.data.group.id;
};

const textPost = async (appId, topicId, lang = 'zh_CN') => {
    const res = await got(`${rootUrl}/webapiv2/topic/v1/detail?id=${topicId}&${X_UA(lang)}`, {
        headers: {
            Referer: `${rootUrl}/app/${appId}`,
        },
    });
    const $ = cheerio.load(res.data.data.first_post.contents.text, null, false);
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
        videoUrl: video?.url,
        posterUrl: video?.raw_cover.url,
    });

module.exports = {
    rootUrl,
    X_UA,
    appId2GroupId,
    textPost,
    videoPost,
};
