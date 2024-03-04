// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const channel = ctx.req.param('channel') ?? 350;
    const currentUrl = `https://www.xkb.com.cn/xkbapp/fundapi/article/api/articles?chnlId=${channel}&visibility=1&page=0&size=20&keyword=`;

    const { data: response } = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            siteId: '35',
        },
    });

    const list = response.data
        .filter((i) => i.contentUrl) // Remove "专题报道" (special report)
        .map((item) => ({
            title: item.listTitle,
            description: art(path.join(__dirname, 'templates/description.art'), {
                thumb: item.shareImg,
            }),
            pubDate: timezone(parseDate(item.operTime), +8),
            link: 'https://www.xkb.com.cn/detail?id=' + item.id,
            contentUrl: item.contentUrl,
            author: item.metaInfo.author,
            chnlName: item.metaInfo.chnlName,
        }));

    let chnlName = '';

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.contentUrl, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.contentUrl,
                });
                item.description += detailResponse.data.htmlContent ?? '';
                chnlName = chnlName === '' ? item.chnlName : chnlName;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `新快报新快网 - ${chnlName}`,
        link: `https://www.xkb.com.cn/home?id=${channel}`,
        item: items,
    });
};
