import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import JSONbig from 'json-bigint';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import cacheIn from './cache';
import { BilibiliWebDynamicResponse, Item2, Modules } from './api-interface';

export const route: Route = {
    path: '/user/dynamic/:uid/:routeParams?',
    categories: ['social-media', 'popular'],
    example: '/bilibili/user/dynamic/2267573',
    parameters: {
        uid: '用户 id, 可在 UP 主主页中找到',
        routeParams: `
| 键           | 含义                              | 接受的值       | 默认值 |
| ------------ | --------------------------------- | -------------- | ------ |
| showEmoji    | 显示或隐藏表情图片                | 0/1/true/false | false  |
| disableEmbed | 关闭内嵌视频                      | 0/1/true/false | false  |
| useAvid      | 视频链接使用 AV 号 (默认为 BV 号) | 0/1/true/false | false  |
| directLink   | 使用内容直链                      | 0/1/true/false | false  |

用例：\`/bilibili/user/dynamic/2267573/showEmoji=1&disableEmbed=1&useAvid=1\``,
    },
    features: {
        requireConfig: [
            {
                name: 'BILIBILI_COOKIE_*',
                optional: true,
                description: `如果没有此配置，那么必须开启 puppeteer 支持；BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，\`{uid}\` 替换为 uid，如 \`BILIBILI_COOKIE_2267573\`，获取方式：
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
    radar: [
        {
            source: ['space.bilibili.com/:uid'],
            target: '/user/dynamic/:uid',
        },
    ],
    name: 'UP 主动态',
    maintainers: ['DIYgod', 'zytomorrow', 'CaoMeiYouRen', 'JimenezLi'],
    handler,
};

const getTitle = (data: Modules): string => {
    const major = data.module_dynamic?.major;
    if (!major) {
        return '';
    }
    if (major.none) {
        return major.none.tips;
    }
    if (major.courses) {
        return `${major.courses?.title} - ${major.courses?.sub_title}`;
    }
    if (major.live_rcmd?.content) {
        // 正在直播的动态
        return JSON.parse(major.live_rcmd.content)?.live_play_info?.title;
    }
    const type = major.type.replace('MAJOR_TYPE_', '').toLowerCase();
    return major[type]?.title;
};
const getDes = (data: Modules): string => {
    let desc = '';
    if (data.module_dynamic?.desc?.text) {
        desc += data.module_dynamic.desc.text;
    }
    const major = data.module_dynamic?.major;
    // 普通转发
    if (!major) {
        return desc;
    }
    // 普通分享
    if (major?.common?.desc) {
        desc += desc ? `<br>//转发自: ${major.common.desc}` : major.common.desc;
        return desc;
    }
    // 转发的直播间
    if (major?.live) {
        return `${major.live?.desc_first}<br>${major.live?.desc_second}`;
    }
    // 正在直播的动态
    if (major.live_rcmd?.content) {
        const live_play_info = JSON.parse(major.live_rcmd.content)?.live_play_info;
        return `${live_play_info?.area_name}·${live_play_info?.watched_show?.text_large}`;
    }
    // 图文动态
    if (major?.opus) {
        return major?.opus?.summary?.text;
    }
    const type = major.type.replace('MAJOR_TYPE_', '').toLowerCase();
    return major[type]?.desc;
};

const getOriginTitle = (data?: Modules) => data && getTitle(data);
const getOriginDes = (data?: Modules) => data && getDes(data);
const getOriginName = (data?: Modules) => data?.module_author?.name;
const getIframe = (data?: Modules, disableEmbed: boolean = false) => {
    if (disableEmbed) {
        return '';
    }
    const aid = data?.module_dynamic?.major?.archive?.aid;
    const bvid = data?.module_dynamic?.major?.archive?.bvid;
    if (!aid) {
        return '';
    }
    return utils.iframe(aid, null, bvid);
};

const getImgs = (data?: Modules) => {
    const imgUrls: string[] = [];
    const major = data?.module_dynamic?.major;
    if (!major) {
        return '';
    }
    // 动态图片
    if (major.opus?.pics?.length) {
        imgUrls.push(...major.opus.pics.map((e) => e.url));
    }
    // 专栏封面
    if (major.article?.covers?.length) {
        imgUrls.push(...major.article.covers);
    }
    // 相簿
    if (major.draw?.items?.length) {
        imgUrls.push(...major.draw.items.map((e) => e.src));
    }
    // 正在直播的动态
    if (major.live_rcmd?.content) {
        imgUrls.push(JSON.parse(major.live_rcmd.content)?.live_play_info?.cover);
    }
    const type = major.type.replace('MAJOR_TYPE_', '').toLowerCase();
    if (major[type]?.cover) {
        imgUrls.push(major[type].cover);
    }
    return imgUrls.map((url) => `<img src="${url}">`).join('');
};

const getUrl = (item?: Item2, useAvid = false) => {
    const data = item?.modules;
    if (!data) {
        return null;
    }
    let url = '';
    let text = '';
    const major = data.module_dynamic?.major;
    if (!major) {
        return null;
    }
    switch (major?.type) {
        case 'MAJOR_TYPE_UGC_SEASON':
            url = major?.ugc_season?.jump_url || '';
            text = `合集地址：<a href=${url}>${url}</a>`;
            break;
        case 'MAJOR_TYPE_ARTICLE':
            url = `https://www.bilibili.com/read/cv${major?.article?.id}`;
            text = `专栏地址：<a href=${url}>${url}</a>`;
            break;
        case 'MAJOR_TYPE_ARCHIVE': {
            const archive = major?.archive;
            const id = useAvid ? `av${archive?.aid}` : archive?.bvid;
            url = `https://www.bilibili.com/video/${id}`;
            text = `视频地址：<a href=${url}>${url}</a>`;
            break;
        }
        case 'MAJOR_TYPE_COMMON':
            url = major?.common?.jump_url || '';
            text = `地址：<a href=${url}>${url}</a>`;
            break;
        case 'MAJOR_TYPE_OPUS':
            if (item?.type === 'DYNAMIC_TYPE_ARTICLE') {
                url = `https:${major?.opus?.jump_url}`;
                text = `专栏地址：<a href=${url}>${url}</a>`;
            } else if (item?.type === 'DYNAMIC_TYPE_DRAW') {
                url = `https:${major?.opus?.jump_url}`;
                text = `图文地址：<a href=${url}>${url}</a>`;
            }
            break;
        case 'MAJOR_TYPE_PGC': {
            const pgc = major?.pgc;
            url = `https://www.bilibili.com/bangumi/play/ep${pgc?.epid}&season_id=${pgc?.season_id}`;
            text = `剧集地址：<a href=${url}>${url}</a>`;
            break;
        }
        case 'MAJOR_TYPE_COURSES':
            url = `https://www.bilibili.com/cheese/play/ss${major?.courses?.id}`;
            text = `课程地址：<a href=${url}>${url}</a>`;
            break;
        case 'MAJOR_TYPE_MUSIC':
            url = `https://www.bilibili.com/audio/au${major?.music?.id}`;
            text = `音频地址：<a href=${url}>${url}</a>`;
            break;
        case 'MAJOR_TYPE_LIVE':
            url = `https://live.bilibili.com/${major?.live?.id}`;
            text = `直播间地址：<a href=${url}>${url}</a>`;
            break;
        case 'MAJOR_TYPE_LIVE_RCMD': {
            const live_play_info = JSON.parse(major.live_rcmd?.content || '{}')?.live_play_info;
            url = `https://live.bilibili.com/${live_play_info?.room_id}`;
            text = `直播间地址：<a href=${url}>${url}</a>`;
            break;
        }
        default:
            return null;
    }
    return {
        url,
        text,
    };
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const showEmoji = fallback(undefined, queryToBoolean(routeParams.showEmoji), false);
    const disableEmbed = fallback(undefined, queryToBoolean(routeParams.disableEmbed), false);
    const displayArticle = ctx.req.query('mode') === 'fulltext';
    const useAvid = fallback(undefined, queryToBoolean(routeParams.useAvid), false);
    const directLink = fallback(undefined, queryToBoolean(routeParams.directLink), false);

    const cookie = await cacheIn.getCookie();

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space`,
        searchParams: {
            host_mid: uid,
            platform: 'web',
            features: 'itemOpusStyle,listOnlyfans,opusBigCover,onlyfansVote',
        },
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: cookie,
        },
    });
    const body = JSONbig.parse(response.body);
    if (body?.code === -352) {
        cacheIn.clearCookie();
        throw new Error('The cookie has expired, please try again.');
    }
    const items = (body as BilibiliWebDynamicResponse)?.data?.items;

    const usernameAndFace = await cacheIn.getUsernameAndFaceFromUID(uid);
    const author = usernameAndFace[0] ?? items[0]?.modules?.module_author?.name;
    const face = usernameAndFace[1] ?? items[0]?.modules?.module_author?.face;
    cache.set(`bili-username-from-uid-${uid}`, author);
    cache.set(`bili-userface-from-uid-${uid}`, face);

    const rssItems = await Promise.all(
        items.map(async (item) => {
            // const parsed = JSONbig.parse(item.card);

            const data = item.modules;
            const origin = item?.orig?.modules;

            // link
            let link = '';
            if (item.id_str) {
                link = `https://t.bilibili.com/${item.id_str}`;
            }

            let description = getDes(data) || '';
            const title = getTitle(data) || description; // 没有 title 的时候使用 desc 填充
            const category: string[] = [];
            // emoji
            if (data.module_dynamic?.desc?.rich_text_nodes?.length) {
                const nodes = data.module_dynamic.desc.rich_text_nodes;
                for (const node of nodes) {
                    // 处理 emoji 的情况
                    if (showEmoji && node?.emoji) {
                        const emoji = node.emoji;
                        description = description.replaceAll(
                            emoji.text,
                            `<img alt="${emoji.text}" src="${emoji.icon_url}" style="margin: -1px 1px 0px; display: inline-block; width: 20px; height: 20px; vertical-align: text-bottom;" title="" referrerpolicy="no-referrer">`
                        );
                    }
                    // 处理转发带图评论的情况
                    if (node?.pics?.length) {
                        const { pics, text } = node;
                        description = description.replaceAll(
                            text,
                            pics
                                .map(
                                    (pic) =>
                                        `<img alt="${text}" src="${pic.src}" style="margin: 0px 0px 0px; display: inline-block; width: ${pic.width}px; height: ${pic.height}px; vertical-align: text-bottom;" title="" referrerpolicy="no-referrer">`
                                )
                                .join('<br>')
                        );
                    }
                    if (node?.type === 'RICH_TEXT_NODE_TYPE_TOPIC') {
                        // 将话题作为 category
                        category.push(node.text.match(/#(\S+)#/)?.[1] || '');
                    }
                }
            }

            if (data.module_dynamic?.major?.opus?.summary?.rich_text_nodes?.length) {
                const nodes = data.module_dynamic.major.opus.summary.rich_text_nodes;
                for (const node of nodes) {
                    if (node?.type === 'RICH_TEXT_NODE_TYPE_TOPIC') {
                        // 将话题作为 category
                        category.push(node.text.match(/#(\S+)#/)?.[1] || '');
                    }
                }
            }

            if (item.type === 'DYNAMIC_TYPE_ARTICLE' && displayArticle) {
                // 抓取专栏全文
                const cvid = data.module_dynamic?.major?.opus?.jump_url?.match?.(/cv(\d+)/)?.[0];
                if (cvid) {
                    description = (await cacheIn.getArticleDataFromCvid(cvid, uid)).description || '';
                }
            }

            const urlResult = getUrl(item, useAvid);
            const urlText = urlResult?.text;
            if (urlResult && directLink) {
                link = urlResult.url;
            }

            const originUrlResult = getUrl(item?.orig, useAvid);
            const originUrlText = originUrlResult?.text;
            if (originUrlResult && directLink) {
                link = originUrlResult.url;
            }

            let originDescription = '';
            const originName = getOriginName(origin);
            const originTitle = getOriginTitle(origin);
            const originDes = getOriginDes(origin);
            if (originName) {
                originDescription += `//转发自: @${getOriginName(origin)}: `;
            }
            if (originTitle) {
                originDescription += originTitle;
            }
            if (originDes) {
                originDescription += `<br>${originDes}`;
            }

            // 换行处理
            description = description.replaceAll('\r\n', '<br>').replaceAll('\n', '<br>');
            originDescription = originDescription.replaceAll('\r\n', '<br>').replaceAll('\n', '<br>');

            const descriptions = [description, originDescription, urlText, originUrlText, getIframe(data, disableEmbed), getIframe(origin, disableEmbed), getImgs(data), getImgs(origin)]
                .filter(Boolean)
                .map((e) => e?.trim())
                .join('<br>');

            return {
                title,
                description: descriptions,
                pubDate: data.module_author?.pub_ts ? parseDate(data.module_author.pub_ts, 'X') : undefined,
                link,
                author,
                category: category.length ? category : undefined,
            };
        })
    );

    return {
        title: `${author} 的 bilibili 动态`,
        link: `https://space.bilibili.com/${uid}/dynamic`,
        description: `${author} 的 bilibili 动态`,
        image: face,
        logo: face,
        icon: face,
        item: rssItems,
    };
}
