const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');

const rootUrl = 'https://www.taptap.com';
const typeMap = {
    feed: {
        zh_CN: '最新',
        zh_TW: '最新',
    },
    official: {
        zh_CN: '官方',
        zh_TW: '官方',
    },
    elite: {
        zh_CN: '精华',
        zh_TW: '精華',
    },
    video: {
        zh_CN: '影片',
        zh_TW: '影片',
    },
};

const appId2GroupId = async (appId, lang = 'zh_CN') => {
    const res = await got(`${rootUrl}/webapiv2/group/v1/detail?app_id=${appId}&X-UA=V=1%26PN=WebApp%26VN=0.1.0%26LANG=${lang}%26PLT=PC`, {
        headers: {
            Referer: `${rootUrl}/app/${appId}`,
        },
    });
    return res.data.data.group.id;
};

const textPost = async (appId, topicId, lang = 'zh_CN') => {
    const res = await got(`${rootUrl}/webapiv2/topic/v1/detail?id=${topicId}&X-UA=V=1%26PN=WebApp%26VN=0.1.0%26LANG=${lang}%26PLT=PC`, {
        headers: {
            Referer: `${rootUrl}/app/${appId}`,
        },
    });
    const $ = cheerio.load(res.data.data.first_post.contents.text);
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

module.exports = async (ctx) => {
    const lang = ctx.params.lang ?? 'zh_CN';
    const appId = ctx.params.id;
    const groupId = await appId2GroupId(appId, lang);
    const type = ctx.params.type ?? 'feed';
    const sort = ctx.params.sort ?? 'created';

    const url = `${rootUrl}/webapiv2/feed/v6/by-group?group_id=${groupId}&type=${type}&sort=${sort}&X-UA=V=1%26PN=WebApp%26VN=0.1.0%26LANG=${lang}%26PLT=PC`;

    const topics_list_response = await got(url);
    const topics_list = topics_list_response.data;

    const app_img = topics_list.data.list[0].moment.app.icon.url;
    const app_name = topics_list.data.list[0].moment.app.title;

    const out = topics_list.data.list.map(async (list) => {
        const author = list.moment.author.user.name;
        const topicId = list.moment.extended_entities?.topics?.[0].id;
        // raw_text sometimes is "" so || is better than ??
        const title = list.moment.contents.raw_text || list.moment.extended_entities?.topics?.[0].title || list.moment.extended_entities?.videos?.[0].title;
        const createdTime = list.moment.created_time * 1000;
        const link = list.moment.sharing?.url || list.moment.extended_entities?.topics?.[0].sharing.url || list.moment.extended_entities?.videos?.[0].sharing.url;
        let description = '';
        try {
            description = await textPost(appId, topicId, lang);
        } catch (e) {
            description = list.moment.extended_entities?.topics?.[0].summary || list.moment.contents.raw_text || videoPost(list.moment.extended_entities?.videos?.[0]);
        }

        return {
            title,
            description,
            author,
            link,
            pubDate: parseDate(createdTime),
        };
    });

    ctx.state.data = {
        title: `${app_name} - ${typeMap[type][lang]} - TapTap 论坛`,
        link: `${rootUrl}/app/${appId}/topic?type=${type}&sort=${sort}`,
        image: app_img,
        item: out.filter((item) => item !== ''),
    };

    ctx.state.json = {
        title: `${app_name} - ${typeMap[type][lang]} - TapTap 论坛`,
        link: `${rootUrl}/app/${appId}/topic?type=${type}&sort=${sort}`,
        image: app_img,
        item: out.filter((item) => item !== ''),
        appId,
        groupId,
        topics_list,
    };
};
