import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import bilibiliCache from './cache';

export const route: Route = {
    path: '/message/sessions/:uid',
    categories: ['social-media'],
    example: '/bilibili/message/sessions/2267573',
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
    name: '我的消息',
    maintainers: ['pilgrimlyieu'],
    handler,
    description: `:::warning
  用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

interface SessionItem {
    talker_id: number;
    session_type: number;
    at_seqno: number;
    top_ts: number;
    group_name: string;
    group_cover: string;
    is_follow: number;
    is_dnd: number;
    ack_seqno: number;
    ack_ts: number;
    session_ts: number;
    unread_count: number;
    last_msg: {
        sender_uid: number;
        receiver_type: number;
        receiver_id: number;
        msg_type: number;
        content: string;
        msg_seqno: number;
        timestamp: number;
        at_uids: number[] | null;
        msg_key: number;
        msg_status: number;
        notify_code: string;
        msg_source: number;
    } | null;
    group_type: number;
    can_fold: number;
    status: number;
    max_seqno: number;
    new_push_msg: number;
    setting: number;
    is_guardian: number;
    is_intercept: number;
    is_trust: number;
    system_msg_type: number;
    live_status: number;
    biz_msg_unread_count: number;
    user_label: unknown;
}

interface SessionResponse {
    code: number;
    msg: string;
    message: string;
    ttl: number;
    data: {
        session_list: SessionItem[] | null;
        has_more: number;
        anti_disturb_cleaning: boolean;
        is_address_list_empty: number;
        system_msg: Record<string, number>;
        show_level: boolean;
    };
}

interface UserInfo {
    mid: string;
    face: string;
    name: string;
}

interface UserCardsResponse {
    code: number;
    message: string;
    ttl: number;
    data: Record<string, UserInfo>;
}

/**
 * Parse message content based on msg_type
 * msg_type 1: text, 2: image, 5: recall, etc.
 */
function parseMessageContent(content: string, msgType: number): string {
    try {
        const parsed = JSON.parse(content);
        switch (msgType) {
            case 1: // Text message
                return parsed.content || content;
            case 2: // Image
                return `[图片] ${parsed.url || ''}`;
            case 5: // Recall
                return '[消息已撤回]';
            case 6: // Sticker
                return '[表情]';
            case 7: // Share
                return `[分享] ${parsed.title || ''}`;
            case 10: // System notification
                return parsed.content || parsed.title || content;
            case 11: // Video card
                return `[视频] ${parsed.title || ''}`;
            case 12: // Article card
                return `[专栏] ${parsed.title || ''}`;
            case 14: // Bangumi card
                return `[番剧] ${parsed.title || ''}`;
            default:
                return parsed.content || parsed.title || content;
        }
    } catch {
        return content;
    }
}

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await bilibiliCache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await ofetch<SessionResponse>('https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions', {
        query: {
            session_type: 1,
            group_fold: 1,
            unfollow_fold: 0,
            sort_rule: 2,
            build: 0,
            mobi_app: 'web',
        },
        headers: {
            Referer: 'https://message.bilibili.com/',
            Cookie: cookie,
        },
    });

    if (response.code !== 0) {
        throw new Error(response.message ?? response.msg ?? `Error code ${response.code}`);
    }

    const sessionList = response.data.session_list || [];
    const talkerIds = sessionList.filter((s) => s.session_type === 1).map((s) => s.talker_id);

    // Fetch user info for all talkers
    let userCards: Record<string, UserInfo> = {};
    if (talkerIds.length > 0) {
        const userCardsResponse = await cache.tryGet(
            `bilibili-user-cards-${talkerIds.join(',')}`,
            async () => {
                const res = await ofetch<UserCardsResponse>('https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards', {
                    query: {
                        uids: talkerIds.join(','),
                        build: 0,
                        mobi_app: 'web',
                    },
                    headers: {
                        Referer: 'https://message.bilibili.com/',
                        Cookie: cookie,
                    },
                });
                return res.data || {};
            },
            config.cache.routeExpire
        );
        userCards = userCardsResponse as Record<string, UserInfo>;
    }

    const items: DataItem[] = sessionList
        .filter((session) => session.last_msg)
        .map((session) => {
            const lastMsg = session.last_msg!;
            const talkerId = session.talker_id;
            const userInfo = userCards[String(talkerId)];
            const talkerName = userInfo?.name || `用户${talkerId}`;
            const talkerFace = userInfo?.face || '';

            const msgContent = parseMessageContent(lastMsg.content, lastMsg.msg_type);
            const isSentByMe = lastMsg.sender_uid === Number(uid);

            let description = '';
            if (talkerFace) {
                description += `<p><img src="${talkerFace.replace('http://', 'https://')}" width="48" height="48" style="border-radius: 50%;" /></p>`;
            }

            description += isSentByMe ? `<p><strong>你</strong> 对 <strong>${talkerName}</strong> 说：</p>` : `<p><strong>${talkerName}</strong> 说：</p>`;
            description += `<blockquote>${msgContent}</blockquote>`;

            if (session.unread_count > 0) {
                description += `<p>未读消息: ${session.unread_count} 条</p>`;
            }

            const title = isSentByMe ? `你对 ${talkerName} 说：${msgContent}` : `${talkerName}：${msgContent}`;

            return {
                title,
                description,
                link: `https://message.bilibili.com/#/whisper/mid${talkerId}`,
                pubDate: parseDate(lastMsg.timestamp * 1000),
                author: isSentByMe ? name : talkerName,
                guid: `bilibili-session-${talkerId}-${lastMsg.msg_key}`,
            };
        });

    return {
        title: `${name} 的 B站消息 - 我的消息`,
        link: 'https://message.bilibili.com/#/whisper',
        description: `${name} 的 B站消息 - 我的消息`,
        item: items,
        allowEmpty: true,
    };
}
