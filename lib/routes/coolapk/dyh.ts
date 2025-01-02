import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/dyh/:dyhId',
    categories: ['social-media'],
    example: '/coolapk/dyh/1524',
    parameters: { dyhId: '看看号ID' },
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
    name: '看看号',
    maintainers: ['xizeyoupan'],
    handler,
    description: `::: tip
  仅限于采集**站内订阅**的看看号的内容。看看号 ID 可在看看号界面右上分享 - 复制链接得到。
:::`,
};

async function handler(ctx) {
    const dyhId = ctx.req.param('dyhId');
    const full_url = utils.base_url + `/v6/dyhArticle/list?dyhId=${dyhId}&type=all&page=1`;
    const r = await got(`${utils.base_url}/v6/dyh/detail?dyhId=${dyhId}`, {
        headers: utils.getHeaders(),
    });
    let targetTitle = r.data.data.title;
    const feedDescription = r.data.data.description;
    const response = await got(full_url, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    let out = await Promise.all(
        data.map((item) => {
            if (!targetTitle) {
                targetTitle = item.targetRow.title;
            }

            return utils.parseDynamic(item);
        })
    );

    out = out.filter(Boolean); // 去除空值
    if (out.length === 0) {
        throw new InvalidParameterError('仅限于采集站内订阅的看看号的图文及动态内容。这个ID可能是站外订阅。');
    }
    return {
        title: `酷安看看号-${targetTitle}`,
        link: `https://www.coolapk.com/dyh/${dyhId}`,
        description: feedDescription,
        item: out,
    };
}
