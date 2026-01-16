import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import cache from './cache';

export const route: Route = {
    path: '/message/unread/:uid',
    categories: ['social-media'],
    example: '/bilibili/message/unread/2267573',
    parameters: { uid: '用户 id' },
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
    name: '未读消息',
    maintainers: ['pilgrimlyieu'],
    handler,
    description: `:::warning
  用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

  此路由返回所有未读消息类型的汇总状态。
:::`,
};

interface UnreadMsgResponse {
    code: number;
    message: string;
    ttl: number;
    data: {
        at: number;
        coin: number;
        danmu: number;
        favorite: number;
        like: number;
        recv_like: number;
        recv_reply: number;
        reply: number;
        sys_msg: number;
        sys_msg_style: number;
        up: number;
    };
}

interface UnreadSessionResponse {
    code: number;
    msg: string;
    message: string;
    ttl: number;
    data: {
        unfollow_unread: number;
        follow_unread: number;
        unfollow_push_msg: number;
        dustbin_push_msg: number;
        dustbin_unread: number;
        biz_msg_unfollow_unread: number;
        biz_msg_follow_unread: number;
        custom_unread: number;
    };
}

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    // Fetch message unread counts
    const [msgUnread, sessionUnread] = await Promise.all([
        ofetch<UnreadMsgResponse>('https://api.vc.bilibili.com/x/im/web/msgfeed/unread', {
            query: {
                build: 0,
                mobi_app: 'web',
            },
            headers: {
                Referer: 'https://message.bilibili.com/',
                Cookie: cookie,
            },
        }),
        ofetch<UnreadSessionResponse>('https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread', {
            query: {
                unread_type: 0,
                show_dustbin: 1,
                build: 0,
                mobi_app: 'web',
            },
            headers: {
                Referer: 'https://message.bilibili.com/',
                Cookie: cookie,
            },
        }),
    ]);

    if (msgUnread.code !== 0) {
        throw new Error(msgUnread.message ?? `Error code ${msgUnread.code}`);
    }

    const msgData = msgUnread.data;
    const sessionData = sessionUnread.data;

    const items: DataItem[] = [];
    const now = new Date();

    // 回复我的
    if (msgData.recv_reply > 0 || msgData.reply > 0) {
        const replyCount = msgData.recv_reply || msgData.reply;
        items.push({
            title: `回复我的：${replyCount} 条未读`,
            description: `<p>你有 <strong>${replyCount}</strong> 条未读回复消息</p><p><a href="https://message.bilibili.com/#/reply">点击查看</a></p>`,
            link: 'https://message.bilibili.com/#/reply',
            pubDate: now,
            guid: `bilibili-unread-reply-${uid}-${replyCount}`,
        });
    }

    // @我的
    if (msgData.at > 0) {
        items.push({
            title: `@我的：${msgData.at} 条未读`,
            description: `<p>你有 <strong>${msgData.at}</strong> 条未读@消息</p><p><a href="https://message.bilibili.com/#/at">点击查看</a></p>`,
            link: 'https://message.bilibili.com/#/at',
            pubDate: now,
            guid: `bilibili-unread-at-${uid}-${msgData.at}`,
        });
    }

    // 收到的赞
    if (msgData.recv_like > 0 || msgData.like > 0) {
        const likeCount = msgData.recv_like || msgData.like;
        items.push({
            title: `收到的赞：${likeCount} 条未读`,
            description: `<p>你有 <strong>${likeCount}</strong> 条未读点赞消息</p><p><a href="https://message.bilibili.com/#/love">点击查看</a></p>`,
            link: 'https://message.bilibili.com/#/love',
            pubDate: now,
            guid: `bilibili-unread-like-${uid}-${likeCount}`,
        });
    }

    // 系统通知
    if (msgData.sys_msg > 0) {
        items.push({
            title: `系统通知：${msgData.sys_msg} 条未读`,
            description: `<p>你有 <strong>${msgData.sys_msg}</strong> 条未读系统通知</p><p><a href="https://message.bilibili.com/#/system">点击查看</a></p>`,
            link: 'https://message.bilibili.com/#/system',
            pubDate: now,
            guid: `bilibili-unread-system-${uid}-${msgData.sys_msg}`,
        });
    }

    // 私信
    const privateUnread = (sessionData?.follow_unread || 0) + (sessionData?.unfollow_unread || 0);
    if (privateUnread > 0) {
        items.push({
            title: `私信：${privateUnread} 条未读`,
            description: `<p>你有 <strong>${privateUnread}</strong> 条未读私信（已关注: ${sessionData?.follow_unread || 0}，未关注: ${sessionData?.unfollow_unread || 0}）</p><p><a href="https://message.bilibili.com/#/whisper">点击查看</a></p>`,
            link: 'https://message.bilibili.com/#/whisper',
            pubDate: now,
            guid: `bilibili-unread-session-${uid}-${privateUnread}`,
        });
    }

    // 投币
    if (msgData.coin > 0) {
        items.push({
            title: `收到的投币：${msgData.coin} 条未读`,
            description: `<p>你有 <strong>${msgData.coin}</strong> 条未读投币消息</p>`,
            link: 'https://message.bilibili.com/',
            pubDate: now,
            guid: `bilibili-unread-coin-${uid}-${msgData.coin}`,
        });
    }

    // 收藏
    if (msgData.favorite > 0) {
        items.push({
            title: `收到的收藏：${msgData.favorite} 条未读`,
            description: `<p>你有 <strong>${msgData.favorite}</strong> 条未读收藏消息</p>`,
            link: 'https://message.bilibili.com/',
            pubDate: now,
            guid: `bilibili-unread-favorite-${uid}-${msgData.favorite}`,
        });
    }

    // UP主助手 messages
    if (msgData.up > 0) {
        items.push({
            title: `UP主助手：${msgData.up} 条未读`,
            description: `<p>你有 <strong>${msgData.up}</strong> 条未读UP主助手消息</p>`,
            link: 'https://message.bilibili.com/',
            pubDate: now,
            guid: `bilibili-unread-up-${uid}-${msgData.up}`,
        });
    }

    return {
        title: `${name} 的 B站未读消息`,
        link: 'https://message.bilibili.com/',
        description: `${name} 的 B站未读消息汇总`,
        item: items,
        allowEmpty: true,
    };
}
