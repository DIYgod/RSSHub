import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';
import utils, { getVideoUrl } from './utils';

// https://www.bilibili.com/v/popular/rank/all

// 0 all https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all&web_location=333.934&w_rid=&wts=
// 1 anime https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=1&web_location=333.934&w_rid=&wts=
// 2 guochuang https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=4&web_location=333.934&w_rid=&wts=
// 4 documentary https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=3&web_location=333.934&w_rid=&wts=
// 5 movie https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=2&web_location=333.934&w_rid=&wts=
// 6 tv https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=5&web_location=333.934&w_rid=&wts=
// 7 variety https://api.bilibili.com/pgc/season/rank/web/list?day=3&season_type=7&web_location=333.934&w_rid=&wts=
// 8 douga https://api.bilibili.com/x/web-interface/ranking/v2?rid=1005&type=all&web_location=333.934&w_rid=&wts=
// 9 game https://api.bilibili.com/x/web-interface/ranking/v2?rid=1008&type=all&web_location=333.934&w_rid=&wts=
// 10 kichiku https://api.bilibili.com/x/web-interface/ranking/v2?rid=1007&type=all&web_location=333.934&w_rid=&wts=
// 11 music https://api.bilibili.com/x/web-interface/ranking/v2?rid=1003&type=all&web_location=333.934&w_rid=&wts=
// 12 dance https://api.bilibili.com/x/web-interface/ranking/v2?rid=1004&type=all&web_location=333.934&w_rid=&wts=
// 13 cinephile https://api.bilibili.com/x/web-interface/ranking/v2?rid=1001&type=all&web_location=333.934&w_rid=&wts=
// 14 ent https://api.bilibili.com/x/web-interface/ranking/v2?rid=1002&type=all&web_location=333.934&w_rid=&wts=
// 15 knowledge https://api.bilibili.com/x/web-interface/ranking/v2?rid=1010&type=all&web_location=333.934&w_rid=&wts=
// 16 tech https://api.bilibili.com/x/web-interface/ranking/v2?rid=1012&type=all&web_location=333.934&w_rid=&wts=
// 17 food https://api.bilibili.com/x/web-interface/ranking/v2?rid=1020&type=all&web_location=333.934&w_rid=&wts=
// 18 car https://api.bilibili.com/x/web-interface/ranking/v2?rid=1013&type=all&web_location=333.934&w_rid=&wts=
// 19 fashion https://api.bilibili.com/x/web-interface/ranking/v2?rid=1014&type=all&web_location=333.934&w_rid=&wts=
// 20 sports https://api.bilibili.com/x/web-interface/ranking/v2?rid=1018&type=all&web_location=333.934&w_rid=&wts=
// 21 animal https://api.bilibili.com/x/web-interface/ranking/v2?rid=1024&type=all&web_location=333.934&w_rid=&wts=

const ridList = {
    0: {
        chinese: '全站',
        english: 'all',
        type: 'x/rid',
    },
    1: {
        chinese: '番剧',
        english: 'bangumi',
        type: 'pgc/web',
    },
    4: {
        chinese: '国创',
        english: 'guochuang',
        type: 'pgc/season',
    },
    3: {
        chinese: '纪录片',
        english: 'documentary',
        type: 'pgc/season',
    },
    2: {
        chinese: '电影',
        english: 'movie',
        type: 'pgc/season',
    },
    5: {
        chinese: '电视剧',
        english: 'tv',
        type: 'pgc/season',
    },
    7: {
        chinese: '综艺',
        english: 'variety',
        type: 'pgc/season',
    },
    1005: {
        chinese: '动画',
        english: 'douga',
        type: 'x/rid',
    },
    1008: {
        chinese: '游戏',
        english: 'game',
        type: 'x/rid',
    },
    1007: {
        chinese: '鬼畜',
        english: 'kichiku',
        type: 'x/rid',
    },
    1003: {
        chinese: '音乐',
        english: 'music',
        type: 'x/rid',
    },
    1004: {
        chinese: '舞蹈',
        english: 'dance',
        type: 'x/rid',
    },
    1001: {
        chinese: '影视',
        english: 'cinephile',
        type: 'x/rid',
    },
    1002: {
        chinese: '娱乐',
        english: 'ent',
        type: 'x/rid',
    },
    1010: {
        chinese: '知识',
        english: 'knowledge',
        type: 'x/rid',
    },
    1012: {
        chinese: '科技数码',
        english: 'tech',
        type: 'x/rid',
    },
    1020: {
        chinese: '美食',
        english: 'food',
        type: 'x/rid',
    },
    1013: {
        chinese: '汽车',
        english: 'car',
        type: 'x/rid',
    },
    1014: {
        chinese: '时尚美妆',
        english: 'fashion',
        type: 'x/rid',
    },
    1018: {
        chinese: '体育运动',
        english: 'sports',
        type: 'x/rid',
    },
    1024: {
        chinese: '动物',
        english: 'animal',
        type: 'x/rid',
    },
};

export const route: Route = {
    path: '/ranking/:rid?/:embed?/:redirect1?/:redirect2?',
    name: '排行榜',
    maintainers: ['DIYgod', 'hyoban'],
    categories: ['social-media'],
    view: ViewType.Videos,
    example: '/bilibili/ranking/all',
    parameters: {
        rid: {
            description: '排行榜分区代号或 rid，可在 URL 中找到',
            default: 'all',
            options: Object.values(ridList)
                .filter((v) => !v.type.startsWith('pgc/'))
                .map((v) => ({
                    value: v.english,
                    label: v.chinese,
                })),
        },
        embed: '默认为开启内嵌视频，任意值为关闭',
        redirect1: '留空，用于兼容之前的路由',
        redirect2: '留空，用于兼容之前的路由',
    },
    radar: [
        {
            source: ['www.bilibili.com/v/popular/rank/:rid'],
            target: '/ranking/:rid',
        },
    ],
    handler,
};

function getAPI(isNumericRid: boolean, rid: string | number) {
    if (isNumericRid) {
        const zone = ridList[rid as number];
        return {
            apiBase: 'https://api.bilibili.com/x/web-interface/ranking/v2',
            apiParams: `rid=${rid}&type=all&web_location=333.934`,
            referer: 'https://www.bilibili.com/v/popular/rank/all',
            ridChinese: zone?.chinese ?? '',
            ridType: 'x/rid',
            link: 'https://www.bilibili.com/v/popular/rank/all',
        };
    }

    const zone = Object.entries(ridList).find(([_, v]) => v.english === rid);
    if (!zone) {
        throw new Error('Invalid rid');
    }
    const numericRid = zone[0];
    const ridType = zone[1].type;
    const ridChinese = zone[1].chinese;
    const ridEnglish = zone[1].english;

    let apiBase = 'https://api.bilibili.com/x/web-interface/ranking/v2';
    let apiParams = '';

    switch (ridType) {
        case 'x/rid':
            apiParams = `rid=${numericRid}&type=all&web_location=333.934`;
            break;
        case 'pgc/web':
            apiBase = 'https://api.bilibili.com/pgc/web/rank/list';
            apiParams = `day=3&season_type=${numericRid}&web_location=333.934`;
            break;
        case 'pgc/season':
            apiBase = 'https://api.bilibili.com/pgc/season/rank/web/list';
            apiParams = `day=3&season_type=${numericRid}&web_location=333.934`;
            break;
        // case 'x/type':
        //     apiUrl = `https://api.bilibili.com/x/web-interface/ranking?rid=0&type=${numericRid}&web_location=333.934`;
        //     break;
        default:
            throw new Error('Invalid rid type');
    }

    return {
        apiBase,
        apiParams,
        referer: `https://www.bilibili.com/v/popular/rank/${ridEnglish}`,
        ridChinese,
        ridType,
        link: `https://www.bilibili.com/v/popular/rank/${ridEnglish}`,
    };
}

async function handler(ctx) {
    const isJsonFeed = ctx.req.query('format') === 'json';
    const args = ctx.req.param();
    if (args.redirect1 || args.redirect2) {
        // redirect old routes like /bilibili/ranking/0/3/1 or /bilibili/ranking/0/3/1/xxx
        const embedArg = args.redirect2 ? '/' + args.redirect2 : '';
        ctx.set('redirect', `/bilibili/ranking/${args.rid}${embedArg}`);
        return null;
    }

    const rid = ctx.req.param('rid') || 'all';
    const embed = !ctx.req.param('embed');
    const isNumericRid = /^\d+$/.test(rid);

    const { apiBase, apiParams, referer, ridChinese, link, ridType } = getAPI(isNumericRid, rid);
    if (ridType.startsWith('pgc/')) {
        throw new Error('This type of ranking is not supported yet');
    }

    const response = await ofetch(`${apiBase}?${apiParams}`, {
        headers: {
            Referer: referer,
            origin: 'https://www.bilibili.com',
        },
    });

    if (response.code !== 0) {
        throw new Error(response.message);
    }
    const data = response.data || response.result;
    const list = data.list || [];
    return {
        title: `bilibili 排行榜-${ridChinese}`,
        link,
        item: await Promise.all(
            list.map(async (item) => {
                const subtitles = isJsonFeed && !config.bilibili.excludeSubtitles && item.bvid ? await cache.getVideoSubtitleAttachment(item.bvid) : [];
                return {
                    title: item.title,
                    description: utils.renderUGCDescription(embed, item.pic, item.desc || item.title, item.aid, undefined, item.bvid),
                    pubDate: item.ctime && parseDate(item.ctime, 'X'),
                    author: item.owner.name,
                    link: !item.ctime || (item.ctime > utils.bvidTime && item.bvid) ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                    image: item.pic,
                    attachments: item.bvid
                        ? [
                              {
                                  url: getVideoUrl(item.bvid),
                                  mime_type: 'text/html',
                                  duration_in_seconds: item.duration,
                              },
                              ...subtitles,
                          ]
                        : undefined,
                };
            })
        ),
    };
}
