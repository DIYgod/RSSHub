import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import { config } from '@/config';
import utils from './utils';
import JSONbig from 'json-bigint';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import querystring from 'node:querystring';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/followings/dynamic/:uid/:routeParams?',
    categories: ['social-media'],
    example: '/bilibili/followings/dynamic/109937383',
    parameters: {
        uid: '用户 id, 可在 UP 主主页中找到',
        routeParams: `
| 键         | 含义                              | 接受的值       | 默认值 |
| ---------- | --------------------------------- | -------------- | ------ |
| showEmoji  | 显示或隐藏表情图片                | 0/1/true/false | false  |
| embed      | 默认开启内嵌视频                  | 0/1/true/false |  true  |
| useAvid    | 视频链接使用 AV 号 (默认为 BV 号) | 0/1/true/false | false  |
| directLink | 使用内容直链                      | 0/1/true/false | false  |
| hideGoods  | 隐藏带货动态                      | 0/1/true/false | false  |

用例：\`/bilibili/followings/dynamic/2267573/showEmoji=1&embed=0&useAvid=1\``,
    },
    features: {
        requireConfig: [
            {
                name: 'BILIBILI_COOKIE_*',
                description: `BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，\`{uid}\` 替换为 uid，如 \`BILIBILI_COOKIE_2267573\`，获取方式：
    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)
    2.  打开控制台，切换到 Network 面板，刷新
    3.  点击 dynamic_new 请求，找到 Cookie
    4.  视频和专栏，UP 主粉丝及关注只要求 \`SESSDATA\` 字段，动态需复制整段 Cookie`,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户关注动态',
    maintainers: ['TigerCubDen', 'JimenezLi'],
    handler,
    description: `::: warning
  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

async function handler(ctx) {
    const uid = String(ctx.req.param('uid'));
    const routeParams = querystring.parse(ctx.req.param('routeParams'));

    const showEmoji = fallback(undefined, queryToBoolean(routeParams.showEmoji), false);
    const embed = fallback(undefined, queryToBoolean(routeParams.embed), true);
    const displayArticle = fallback(undefined, queryToBoolean(routeParams.displayArticle), false);

    const name = await cache.getUsernameFromUID(uid);
    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await got({
        method: 'get',
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type_list=268435455`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    if (response.data.code === -6) {
        throw new ConfigNotFoundError('对应 uid 的 Bilibili 用户的 Cookie 已过期');
    }
    if (response.data.code === 4_100_000) {
        throw new ConfigNotFoundError('对应 uid 的 Bilibili 用户 请求失败');
    }
    const data = JSONbig.parse(response.body).data.cards;

    const getTitle = (data) => (data ? data.title || data.description || data.content || (data.vest && data.vest.content) || '' : '');
    const getDes = (data) =>
        data.dynamic || data.desc || data.description || data.content || data.summary || (data.vest && data.vest.content) + (data.sketch && `<br>${data.sketch.title}<br>${data.sketch.desc_text}`) || data.intro || '';
    const getOriginDes = (data) => (data && (data.apiSeasonInfo && data.apiSeasonInfo.title && `//转发自: ${data.apiSeasonInfo.title}`) + (data.index_title && `<br>${data.index_title}`)) || '';
    const getOriginName = (data) => data.uname || (data.author && data.author.name) || (data.upper && data.upper.name) || (data.user && (data.user.uname || data.user.name)) || (data.owner && data.owner.name) || '';
    const getOriginTitle = (data) => (data.title ? `${data.title}<br>` : '');
    const getIframe = (data) => {
        if (!embed) {
            return '';
        }
        const aid = data?.aid;
        const bvid = data?.bvid;
        if (aid === undefined && bvid === undefined) {
            return '';
        }
        return utils.renderUGCDescription(embed, '', '', aid, undefined, bvid);
    };
    const getImgs = (data) => {
        let imgs = '';
        // 动态图片
        if (data.pictures) {
            for (let i = 0; i < data.pictures.length; i++) {
                imgs += `<img src="${data.pictures[i].img_src}">`;
            }
        }
        // 专栏封面
        if (data.image_urls) {
            for (let i = 0; i < data.image_urls.length; i++) {
                imgs += `<img src="${data.image_urls[i]}">`;
            }
        }
        // 视频封面
        if (data.pic) {
            imgs += `<img src="${data.pic}">`;
        }
        // 音频/番剧/直播间封面/小视频封面
        if (data.cover && data.cover.unclipped) {
            imgs += `<img src="${data.cover.unclipped}">`;
        } else if (data.cover) {
            imgs += `<img src="${data.cover}">`;
        }
        // 专题页封面
        if (data.sketch && data.sketch.cover_url) {
            imgs += `<img src="${data.sketch.cover_url}">`;
        }
        return imgs;
    };

    const items = await Promise.all(
        data.map(async (item) => {
            const parsed = JSONbig.parse(item.card);
            const data = parsed.apiSeasonInfo || (getTitle(parsed.item) ? parsed.item : parsed);
            let origin = parsed.origin;
            if (origin) {
                try {
                    origin = JSONbig.parse(origin);
                } catch {
                    logger.warn(`card.origin '${origin}' is not falsy-valued or a JSON string, fall back to unparsed value`);
                }
            }

            // img
            let imgHTML = '';

            imgHTML += getImgs(data);

            if (origin) {
                imgHTML += getImgs(origin.item || origin);
            }
            // video小视频
            let videoHTML = '';
            if (data.video_playurl) {
                videoHTML += `<video width="${data.width}" height="${data.height}" controls><source src="${unescape(data.video_playurl).replace(/^http:/, 'https:')}"><source src="${unescape(data.video_playurl)}"></video>`;
            }
            // some rss readers disallow http content.
            // 部分 RSS 阅读器要求内容必须使用https传输
            // bilibili short video does support https request, but https request may timeout ocassionally.
            // to maximize content availability, here add two source tags.
            // bilibili的API中返回的视频地址采用http，然而经验证，短视频地址支持https访问，但偶尔会返回超时错误(可能是网络原因)。
            // 因此保险起见加入两个source标签
            // link
            let link = '';
            if (data.dynamic_id) {
                link = `https://t.bilibili.com/${data.dynamic_id}`;
            } else if (item.desc?.dynamic_id) {
                link = `https://t.bilibili.com/${item.desc.dynamic_id}`;
            }

            // emoji
            let data_content = getDes(data);
            if (item.display && item.display.emoji_info && showEmoji) {
                const emoji = item.display.emoji_info.emoji_details;
                for (const item of emoji) {
                    data_content = data_content.replaceAll(
                        new RegExp(`\\${item.text}`, 'g'),
                        `<img alt="${item.text}" src="${item.url}"style="margin: -1px 1px 0px; display: inline-block; width: 20px; height: 20px; vertical-align: text-bottom;" title="" referrerpolicy="no-referrer">`
                    );
                }
            }
            // 作者信息
            let author = '';
            if (item.desc?.user_profile) {
                author = item.desc.user_profile.info.uname;
            }

            if (data.image_urls && displayArticle) {
                data_content = (await cache.getArticleDataFromCvid(data.id, uid)).description;
            }

            return {
                title: getTitle(data),
                author,
                description: (() => {
                    const description = parsed.new_desc || data_content || getDes(data);
                    const originName = origin && getOriginName(origin) ? `<br><br>//转发自: @${getOriginName(origin)}: ${getOriginTitle(origin.item || origin)}${getDes(origin.item || origin)}` : getOriginDes(origin);
                    const imgHTMLSource = imgHTML ? `<br>${imgHTML}` : '';
                    const videoHTMLSource = videoHTML ? `<br>${videoHTML}` : '';

                    return `${description}${originName}${getIframe(data)}${getIframe(origin)}${imgHTMLSource}${videoHTMLSource}`;
                })(),
                pubDate: new Date(item.desc?.timestamp * 1000).toUTCString(),
                link,
            };
        })
    );

    return {
        title: `${name} 关注的动态`,
        link: `https://t.bilibili.com`,
        description: `${name} 关注的动态`,
        item: items,
    };
}
