import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/people/:id',
    categories: ['reading'],
    example: '/kongfz/people/5032170',
    parameters: { id: '用户 id, 可在对应用户页 URL 中找到' },
    name: '用户动态',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const response = await ofetch(`https://t.kongfz.com/api/getFeedList?userId=${id}&size=20`);

    const list = response.result.feedList.map((item) => {
        let feed = item;
        let description;

        if (item.content === '件商品') {
            description = '<ul>';
            for (const i of item.itemList) {
                description += `<li><ul><li><a href="${i.defaultItem.linkUrl}">${i.product.itemName}</a></li><li>作者：${i.product.author}</li><li>品相：${i.product.quality}</li><li>价格：${i.product.price}</li><li><img src="${i.product.imgBig}"></li></ul></li>`;
            }
            description += '</ul>';
        } else {
            if (item.content === '转发动态') {
                feed = item.itemList[0].feed;
            }
            description = feed.content;
        }

        return {
            title: feed.title || feed.postTime,
            link: `https://t.kongfz.com/detail/${feed.feedId}`,
            description,
            pubDate: parseDate(feed.postDateTime),
        };
    });

    const userInfo = response.result.userInfo;

    return {
        title: `孔夫子旧书网 - ${userInfo.nickname}`,
        link: userInfo.shareUrl,
        item: list,
        description: userInfo.sign,
    };
}
