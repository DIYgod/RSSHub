import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { appDetail, getRootUrl, imagePost, topicPost, videoPost, X_UA } from './utils';

interface TopicMoment {
    sharing: { url: string };
    author: { user: { name: string } };
    created_time: number;
    topic: { id_str?: string; title: string; summary: string; pin_video?: object; footer_images?: { images: object[] } };
    repost: { contents: { raw_text: string } };
    reposted_moment: { topic: { id_str: string; title: string; footer_images?: object[] } };
}

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

export const route: Route = {
    path: '/topic/:id/:type?/:sort?/:lang?',
    categories: ['game'],
    example: '/taptap/topic/142793/official',
    parameters: {
        id: '游戏 ID，游戏主页 URL 中获取',
        type: '论坛版块，默认显示所有帖子，论坛版块 URL 中 `type` 参数，见下表，默认为 `feed`',
        sort: '排序，见下表，默认为 `created`',
        lang: '语言，`zh_CN`或`zh_TW`，默认为`zh_CN`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['taptap.cn/app/:id/topic', 'taptap.cn/app/:id'],
            target: '/topic/:id',
        },
        {
            source: ['www.taptap.cn/app/:id/topic', 'www.taptap.cn/app/:id'],
            target: '/topic/:id',
        },
    ],
    name: '游戏论坛',
    maintainers: ['hoilc', 'TonyRL'],
    handler,
    description: `| 全部 | 精华  | 官方     | 影片  |
| ---- | ----- | -------- | ----- |
| feed | elite | official | video |

| 发布时间 | 回复时间  | 默认排序 |
| -------- | --------- | -------- |
| created  | commented | default  |`,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh_CN';
    const appId = ctx.req.param('id');
    const appData = await appDetail(appId, lang);
    const type = ctx.req.param('type') ?? 'feed';
    const sort = ctx.req.param('sort') ?? 'created';
    const groupId = appData.group.id;
    const appImg = appData.app.icon.original_url || appData.app.icon.url;
    const appName = appData.app.title;
    const url = `${getRootUrl(false)}/webapiv2/feed/v7/by-group?group_id=${groupId}&type=${type}&sort=${sort}&${X_UA(lang)}`;

    const topicsList = await ofetch(url);
    const list: Array<{ moment: TopicMoment }> = topicsList.data.list;

    const out = await pMap(
        list,
        async ({ moment }) => {
            const link = moment.sharing.url;
            const isRepost = !moment.topic?.id_str;
            const author = moment.author.user.name;
            const topicId = isRepost ? moment.reposted_moment.topic.id_str : moment.topic.id_str;
            // raw_text sometimes is "" so || is better than ??
            const title = isRepost ? moment.repost.contents.raw_text || '' : moment.topic.title || moment.topic.summary;
            const details = await cache.tryGet(`${link}:body:v3`, async () => {
                let description = isRepost ? moment.repost.contents.raw_text || '' : moment.topic.summary || '';
                if (isRepost) {
                    description += (moment.reposted_moment.topic.title || '') + ((await topicPost(appId, topicId, lang)) || '');
                    if (moment.reposted_moment.topic.footer_images) {
                        description += imagePost(moment.reposted_moment.topic.footer_images);
                    }
                } else if (moment.topic.pin_video) {
                    description += videoPost(moment.topic.pin_video);
                    if (moment.topic.footer_images?.images) {
                        description += imagePost(moment.topic.footer_images.images);
                    }
                } else {
                    description = await topicPost(appId, topicId, lang);
                }
                return {
                    description,
                };
            });
            return { title, author, link, pubDate: parseDate(moment.created_time, 'X'), ...details };
        },
        { concurrency: 3 }
    );

    const ret = {
        title: `${appName} - ${typeMap[type][lang]} - TapTap 论坛`,
        link: `${getRootUrl(false)}/app/${appId}/topic?type=${type}&sort=${sort}`,
        image: appImg,
        item: out,
    };

    ctx.set('json', {
        ...ret,
        appId,
        groupId,
        topicsList,
    });
    return ret;
}
