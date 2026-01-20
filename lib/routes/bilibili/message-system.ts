import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/message/system/:uid',
    categories: ['social-media'],
    example: '/bilibili/message/system/2267573',
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
    name: '系统通知',
    maintainers: ['pilgrimlyieu'],
    handler,
    description: `:::warning
  用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

interface SystemNotifyItem {
    id: number;
    cursor: number;
    publisher: {
        name: string;
        mid: number;
        face: string;
    };
    type: number;
    title: string;
    content: string;
    source: {
        name: string;
        logo: string;
    };
    time_at: string;
    card_type: number;
    card_brief: string;
    card_msg_brief: string;
    card_cover: string;
    card_story_title: string;
    card_link: string;
    mc: string;
    is_station: number;
    is_send: number;
    notify_cursor: number;
}

interface SystemResponse {
    code: number;
    msg: string;
    message: string;
    ttl: number;
    data: {
        system_notify_list: SystemNotifyItem[];
    };
}

/**
 * Parse bilibili message content with special link format
 * Format: #{text}{"url"} -> <a href="url">text</a>
 */
function parseMessageContent(content: string): string {
    // Match pattern like #{text}{"url"}
    const linkPattern = /#\{([^}]+)\}\{"([^"]+)"\}/g;
    return content.replaceAll(linkPattern, '<a href="$2">$1</a>');
}

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await ofetch<SystemResponse>('https://message.bilibili.com/x/sys-msg/query_user_notify', {
        query: {
            page_size: 20,
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

    const items: DataItem[] = (response.data.system_notify_list || []).map((item) => {
        let description = `<p><strong>${item.title}</strong></p>`;
        const parsedContent = parseMessageContent(item.content);
        description += `<p>${parsedContent.replaceAll('\n', '<br>')}</p>`;

        if (item.source.logo) {
            description += `<p><img src="${item.source.logo.replace('http://', 'https://')}" width="40" /></p>`;
        }

        if (item.card_cover) {
            description += `<p><img src="${item.card_cover.replace('http://', 'https://')}" /></p>`;
        }

        const link = item.card_link || 'https://message.bilibili.com/#/system';

        return {
            title: item.title,
            description,
            link,
            pubDate: parseDate(item.time_at),
            guid: `bilibili-system-notify-${item.id}-${item.cursor}`,
        };
    });

    return {
        title: `${name} 的 B站消息 - 系统通知`,
        link: 'https://message.bilibili.com/#/system',
        description: `${name} 的 B站消息 - 系统通知`,
        item: items,
        allowEmpty: true,
    };
}
