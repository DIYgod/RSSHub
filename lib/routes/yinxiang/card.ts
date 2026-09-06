import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/card/:id?',
    categories: ['study'],
    example: '/yinxiang/card/32',
    parameters: { id: '卡片 id，见下表，默认为每周收藏排行榜・TOP5' },
    name: '卡片清单',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
卡片对应的话题、专题等内容过期后，该卡片 id 也会失效，此时填入该卡片 id 将会报错。
:::

| 每周收藏排行榜・TOP5 | 每周热门「读书笔记」榜 TOP5 | 【印象话题】选择的悖论 | 【印象专题】如何一秒洞察问题本质？ | 「识堂开讲」5 位嘉宾精华笔记大放送 | 【印象话题】培养专注力的 5 个步骤 | 🎁 购物清单主题活动获奖结果 |
| -------------------- | --------------------------- | ---------------------- | ---------------------------------- | ---------------------------------- | --------------------------------- | --------------------------- |
| 32                   | 33                          | 101                    | 103                                | 104                                | 105                               | 106                         |`,
};

async function handler(ctx: Context) {
    const { id = '32' } = ctx.req.param();

    const apiUrl = `https://app.yinxiang.com/third/discovery/client/restful/public/discovery/card-holder?cardHolderId=${id}`;
    const response = await ofetch(apiUrl);

    const list = response.card.map((item) => ({
        title: item.title,
        link: item.url,
        author: item.userNickname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(`https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link.split('/note/', 2)[1]}`);

                item.pubDate = parseDate(Number(detailResponse.blogNote.publishTime));

                const description = detailResponse.blogNote.htmlContent;
                item.description = description.includes('<?xml') ? description.match(/<en-note>(.*)<\/en-note>/)[1] : description;

                return item;
            })
        )
    );

    return {
        title: `${response.name} - 印象识堂`,
        link: 'https://www.yinxiang.com/everhub/',
        item: items,
    };
}
