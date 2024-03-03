// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');

export default async (ctx) => {
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
        throw new Error('仅限于采集站内订阅的看看号的图文及动态内容。这个ID可能是站外订阅。');
    }
    ctx.set('data', {
        title: `酷安看看号-${targetTitle}`,
        link: `https://www.coolapk.com/dyh/${dyhId}`,
        description: feedDescription,
        item: out,
    });
};
