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
    const full_url = utils.base_url + `/v6/page/dataList?url=%23%2Ffeed%2FmultiTagFeedList%3FlistType%3Ddateline_desc%26tag=${tag}&title=%E6%9C%80%E6%96%B0%E5%8F%91%E5%B8%83&subTitle=&page=1`;
    const response = await got(full_url, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    let out = await Promise.all(data.map((item) => utils.parseDynamic(item)));

    out = out.filter(Boolean); // 去除空值
    if (out.length === 0) {
        throw new InvalidParameterError('这个话题还没有被创建或现在没有图文及动态内容。');
    }
    return {
        title: `酷安话题-${tag}`,
        link: `https://www.coolapk.com/`,
        description: `酷安话题-${tag}`,
        item: out,
    };
}
