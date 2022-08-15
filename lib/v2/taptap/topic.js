const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl, X_UA, appId2GroupId, textPost, videoPost } = require('./utils');

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

module.exports = async (ctx) => {
    const lang = ctx.params.lang ?? 'zh_CN';
    const appId = ctx.params.id;
    const groupId = await appId2GroupId(appId, lang);
    const type = ctx.params.type ?? 'feed';
    const sort = ctx.params.sort ?? 'created';

    const url = `${rootUrl}/webapiv2/feed/v6/by-group?group_id=${groupId}&type=${type}&sort=${sort}&${X_UA(lang)}`;

    const topics_list_response = await got(url);
    const topics_list = topics_list_response.data;

    let app_img = null;
    let app_name = null;

    const out = topics_list.data.list.map(async (list) => {
        if (app_img === null && app_name === null) {
            const group_info = list.moment.groups.find((grp) => String(grp.group.app_id) === String(appId));
            if (group_info !== null) {
                app_img = group_info.group.icon.medium_url;
                app_name = group_info.group.title;
            }
        }
        const author = list.moment.author.user.name;
        const topicId = list.moment.extended_entities?.topics?.[0].id;
        // raw_text sometimes is "" so || is better than ??
        const title = list.moment.contents?.raw_text || list.moment.extended_entities?.topics?.[0].title || list.moment.extended_entities?.videos?.[0].title;
        const createdTime = list.moment.created_time * 1000;
        const link = list.moment.sharing?.url || list.moment.extended_entities?.topics?.[0].sharing.url || list.moment.extended_entities?.videos?.[0].sharing.url;
        let description = '';
        try {
            description = await textPost(appId, topicId, lang);
        } catch (e) {
            // fallback if 400 bad request
            description = list.moment.extended_entities?.topics?.[0].summary || list.moment.contents?.raw_text || videoPost(list.moment.extended_entities?.videos?.[0]);
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
