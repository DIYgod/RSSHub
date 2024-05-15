import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRootUrl, X_UA, appDetail, imagePost, topicPost, videoPost } from './utils';

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
    parameters: { id: '游戏 ID，游戏主页 URL 中获取', type: '论坛版块，默认显示所有帖子，论坛版块 URL 中 `type` 参数，见下表，默认为 `feed`', sort: '排序，见下表，默认为 `created`', lang: '语言，`zh-CN`或`zh-TW`，默认为`zh-CN`' },
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
            source: ['taptap.com/app/:id/topic', 'taptap.com/app/:id'],
            target: '/topic/:id',
        },
    ],
    name: '游戏论坛',
    maintainers: ['hoilc', 'TonyRL'],
    handler,
    description: `| 全部 | 精华  | 官方     | 影片  |
  | ---- | ----- | -------- | ----- |
  | feed | elite | official | video |

  | 发布时间 | 回复时间  |
  | -------- | --------- |
  | created  | commented |`,
};

async function handler(ctx) {
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

    const ret = {
        title: `${app_name} - ${typeMap[type][lang]} - TapTap 论坛`,
        link: `${getRootUrl(false)}/app/${appId}/topic?type=${type}&sort=${sort}`,
        image: app_img,
        item: out.filter((item) => item !== ''),
    };

    ctx.set('json', {
        ...ret,
        appId,
        groupId,
        topics_list,
    });
    return ret;
}
