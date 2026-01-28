import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/message/at/:uid',
    categories: ['social-media'],
    example: '/bilibili/message/at/2267573',
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
    name: '@我的',
    maintainers: ['pilgrimlyieu'],
    handler,
    description: `:::warning
  用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`,
};

interface AtItem {
    id: number;
    user: {
        mid: number;
        fans: number;
        nickname: string;
        avatar: string;
        mid_link: string;
        follow: boolean;
    };
    item: {
        subject_id: number;
        root_id: number;
        source_id: number;
        target_id: number;
        type: string;
        business_id: number;
        business: string;
        title: string;
        desc: string;
        image: string;
        uri: string;
        native_uri: string;
        detail_title: string;
        source_content: string;
        at_details: unknown[];
    };
    at_time: number;
}

interface AtResponse {
    code: number;
    message: string;
    ttl: number;
    data: {
        cursor: {
            is_end: boolean;
            id: number;
            time: number;
        };
        items: AtItem[];
    };
}

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);

    const cookie = config.bilibili.cookies[uid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值');
    }

    const response = await ofetch<AtResponse>('https://api.bilibili.com/x/msgfeed/at', {
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

    const items: DataItem[] = (response.data.items || []).map((item) => {
        const atUser = item.user;
        const atItem = item.item;
        const sourceContent = atItem.source_content;

        let description = `<p><strong>${atUser.nickname}</strong> @了你：</p>`;
        description += `<blockquote>${sourceContent}</blockquote>`;

        if (atItem.image) {
            description += `<p><img src="${atItem.image.replace('http://', 'https://')}" /></p>`;
        }

        description += `<p>来自：${atItem.business} - ${atItem.title}</p>`;

        // Generate link with root_id for direct navigation
        let link = atItem.uri;
        if (atItem.root_id && atItem.uri) {
            link = `${atItem.uri}/#reply${atItem.root_id}`;
        } else if (atItem.source_id && atItem.uri) {
            link = `${atItem.uri}/#reply${atItem.source_id}`;
        }

        return {
            title: `${atUser.nickname} @了你：${sourceContent}`,
            description,
            link,
            pubDate: parseDate(item.at_time * 1000),
            author: atUser.nickname,
        };
    });

    return {
        title: `${name} 的 B站消息 - @我的`,
        link: 'https://message.bilibili.com/#/at',
        description: `${name} 的 B站消息 - @我的`,
        item: items,
        allowEmpty: true,
    };
}
