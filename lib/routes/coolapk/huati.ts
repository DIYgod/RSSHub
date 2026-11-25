import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/huati/:tag',
    categories: ['social-media'],
    example: '/coolapk/huati/iPhone',
    parameters: { tag: '话题名称' },
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
    name: '话题',
    maintainers: ['xizeyoupan'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const fullUrl = new URL('/v6/page/dataList', utils.base_url);
    fullUrl.searchParams.set('url', `#/feed/multiTagFeedList?${new URLSearchParams({ listType: 'dateline_desc', tag }).toString()}`);
    fullUrl.searchParams.set('title', '最新发布');
    fullUrl.searchParams.set('subTitle', '');
    fullUrl.searchParams.set('page', '1');
    const response = await got(fullUrl, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    let out = await Promise.all(utils.selectDynamics(data).map((item) => utils.parseDynamic(item)));

    out = out.filter(Boolean); // 去除空值
    if (out.length === 0) {
        throw new InvalidParameterError('这个话题还没有被创建或现在没有图文及动态内容。');
    }
    return {
        title: `酷安话题-${tag}`,
        link: 'https://www.coolapk.com/',
        description: `酷安话题-${tag}`,
        item: out,
    };
}
