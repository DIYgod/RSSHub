import type { Data, Route } from '@/types';
import type { Context } from 'hono';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { TopicsResponse, UserInfoResponse } from './types';
import { customFetch, generateTopicDataItem } from './utils';

export const route: Route = {
    name: '用户足迹',
    categories: ['social-media'],
    path: '/user/:id',
    example: '/zsxq/user/2414218251',
    parameters: {
        id: '用户id，从网页端url中获取',
    },
    maintainers: ['KarasuShin'],
    radar: [
        {
            source: ['wx.zsxq.com/dweb2/index/footprint/:id'],
        },
    ],
    features: {
        requireConfig: [
            {
                name: 'ZSXQ_ACCESS_TOKEN',
                description:
                    '知识星球访问令牌,获取方式：\n1. 登录知识星球网页版\n2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://wx.zsxq.com\n4. 复制 Cookie 中的 zsxq_access_token 值',
            },
        ],
    },
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const uid = ctx.req.param('id');
    const accessToken = config.zsxq.accessToken;

    if (!accessToken) {
        throw new ConfigNotFoundError('该 RSS 源由于配置不正确而被禁用：令牌丢失。');
    }

    let count = Number(ctx.req.query('limit')) || 20;
    if (count > 30) {
        count = 30;
    }

    const userInfo = await customFetch<UserInfoResponse>(`/users/${uid}`);

    const { topics } = await customFetch<TopicsResponse>(`/users/${uid}/topics/footprint?count=${count}`);

    return {
        title: `知识星球 - ${userInfo.user.name}`,
        description: userInfo.user.introduction,
        image: userInfo.user.avatar_url,
        link: `https://wx.zsxq.com/dweb2/index/footprint/${uid}`,
        item: generateTopicDataItem(topics),
    };
}
