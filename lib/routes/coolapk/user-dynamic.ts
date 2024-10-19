import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/user/:uid/dynamic',
    categories: ['social-media'],
    example: '/coolapk/user/3177668/dynamic',
    parameters: { uid: '在个人界面右上分享-复制链接获取' },
    features: {
        requireConfig: [
            {
                name: 'ALLOW_USER_HOTLINK_TEMPLATE',
                optional: true,
                description: '设置为`true`并添加`image_hotlink_template`参数来代理图片',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户',
    maintainers: ['xizeyoupan'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const full_url = utils.base_url + `/v6/user/feedList?uid=${uid}&page=1&showAnonymous=0&isIncludeTop=1&showDoing=1`;
    let username;
    const response = await got(full_url, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;
    if (!data) {
        throw new InvalidParameterError('这个人没有任何动态。');
    }
    let out = await Promise.all(
        data.map((item) => {
            if (!username) {
                username = item.username;
            }

            return utils.parseDynamic(item);
        })
    );

    out = out.filter(Boolean); // 去除空值
    if (out.length === 0) {
        throw new InvalidParameterError('这个人还没有图文或动态。');
    }
    return {
        title: `酷安个人动态-${username}`,
        link: `https://www.coolapk.com/u/${uid}`,
        description: `酷安个人动态-${username}`,
        item: out,
    };
}
