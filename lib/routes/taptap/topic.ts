// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { getRootUrl, X_UA, appDetail, imagePost, topicPost, videoPost } = require('./utils');

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

export default async (ctx) => {
    const lang = ctx.req.param('lang') ?? 'zh_CN';
    const appId = ctx.req.param('id');
    const appData = await appDetail(appId, lang);
    const type = ctx.req.param('type') ?? 'feed';
    const sort = ctx.req.param('sort') ?? 'created';
    const groupId = appData.group.id;
    const app_img = appData.app.icon.original_url || appData.app.icon.url;
    const app_name = appData.app.title;
    const url = `${getRootUrl(false)}/webapiv2/feed/v6/by-group?group_id=${groupId}&type=${type}&sort=${sort}&${X_UA(lang)}`;

    const topics_list_response = await got(url);
    const topics_list = topics_list_response.data;

    const out = await Promise.all(
        topics_list.data.list.map((list) => {
            const link = list.moment.sharing?.url || list.moment.extended_entities?.topics?.[0].sharing.url || list.moment.extended_entities?.videos?.[0].sharing.url;

            return cache.tryGet(link, async () => {
                const author = list.moment.author.user.name;
                const topicId = list.moment.extended_entities?.topics?.[0].id;
                // raw_text sometimes is "" so || is better than ??
                const title = list.moment.contents?.raw_text || list.moment.extended_entities?.topics?.[0].title || list.moment.extended_entities?.videos?.[0].title;
                const createdTime = list.moment.created_time;
                let description = '';
                if (topicId) {
                    description = await topicPost(appId, topicId, lang);
                } else {
                    description = list.moment.extended_entities?.topics?.[0].summary || list.moment.contents?.raw_text || videoPost(list.moment.extended_entities?.videos?.[0]);
                    if (list.moment.extended_entities?.images) {
                        description += imagePost(list.moment.extended_entities.images);
                    }
                }

                return {
                    title,
                    description,
                    author,
                    link,
                    pubDate: parseDate(createdTime, 'X'),
                };
            });
        })
    );

    ctx.set('data', {
        title: `${app_name} - ${typeMap[type][lang]} - TapTap 论坛`,
        link: `${getRootUrl(false)}/app/${appId}/topic?type=${type}&sort=${sort}`,
        image: app_img,
        item: out.filter((item) => item !== ''),
    });

    ctx.set('json', {
        title: `${app_name} - ${typeMap[type][lang]} - TapTap 论坛`,
        link: `${getRootUrl(false)}/app/${appId}/topic?type=${type}&sort=${sort}`,
        image: app_img,
        item: out.filter((item) => item !== ''),
        appId,
        groupId,
        topics_list,
    });
};
