import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/message/like/:uid',
    categories: ['social-media'],
    example: '/bilibili/message/like/2267573',
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
    name: '收到的赞',
    maintainers: ['pilgrimlyieu'],
    handler,
    description: `:::warning
  用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

interface LikeUser {
    mid: number;
    fans: number;
    nickname: string;
    avatar: string;
    mid_link: string;
    follow: boolean;
}

interface LikeItem {
    id: number;
    users: LikeUser[];
    item: {
        item_id: number;
        pid: number;
        type: string;
        business: string;
        business_id: number;
        reply_business_id: number;
        like_business_id: number;
        title: string;
        desc: string;
        image: string;
        uri: string;
        detail_name: string;
        native_uri: string;
        ctime: number;
    };
    counts: number;
    like_time: number;
    notice_state: number;
}

interface LikeResponse {
    code: number;
    message: string;
    ttl: number;
    data: {
        latest: {
            items: LikeItem[];
            last_view_at: number;
        };
        total: {
            cursor: {
                is_end: boolean;
                id: number;
                time: number;
            };
            items: LikeItem[];
        };
    };
}

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await ofetch<LikeResponse>('https://api.bilibili.com/x/msgfeed/like', {
        query: {
            platform: 'web',
            build: 0,
            mobi_app: 'web',
        },
        headers: {
            Referer: 'https://message.bilibili.com/',
            Cookie: cookie,
        },
    });

    if (response.code !== 0) {
        throw new Error(response.message ?? `Error code ${response.code}`);
    }

    const allItems = [...(response.data.latest?.items || []), ...(response.data.total?.items || [])];

    // Deduplicate by id
    const uniqueItems = allItems.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));

    const items: DataItem[] = uniqueItems.map((item) => {
        const likeUsers = item.users;
        const likeItem = item.item;
        const counts = item.counts;

        const userNames = likeUsers.map((u) => u.nickname).join('、');
        const displayNames = counts > likeUsers.length ? `${userNames} 等 ${counts} 人` : userNames;

        let description = `<p><strong>${displayNames}</strong> 赞了你的${likeItem.business}：</p>`;
        description += `<p><strong>${likeItem.title}</strong></p>`;

        if (likeItem.desc) {
            description += `<blockquote>${likeItem.desc}</blockquote>`;
        }

        if (likeItem.image) {
            description += `<p><img src="${likeItem.image.replace('http://', 'https://')}" /></p>`;
        }

        // Generate link based on type
        let link = likeItem.uri;
        if (likeItem.type === 'reply' && likeItem.item_id) {
            link = `${likeItem.uri}/#reply${likeItem.item_id}`;
        }

        return {
            title: `${displayNames} 赞了你的${likeItem.business}「${likeItem.title}」`,
            description,
            link,
            pubDate: parseDate(item.like_time * 1000),
            author: userNames,
        };
    });

    return {
        title: `${name} 的 B站消息 - 收到的赞`,
        link: 'https://message.bilibili.com/#/love',
        description: `${name} 的 B站消息 - 收到的赞`,
        item: items,
        allowEmpty: true,
    };
}
