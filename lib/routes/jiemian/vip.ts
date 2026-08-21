import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { feedMeta, fetchArticle, parseCardList } from './common';

export const route: Route = {
    path: '/pro/lists/:id',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: 'VIP',
    example: '/jiemian/pro/lists/12',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| [投资早晚报](https://www.jiemian.com/pro/lists/12.html) | [宏观晚 6 点](https://www.jiemian.com/pro/lists/20.html) | [打新早报](https://www.jiemian.com/pro/lists/21.html) | [盘前机会前瞻](https://www.jiemian.com/pro/lists/13.html) | [公告快评](https://www.jiemian.com/pro/lists/14.html) | [盘中必读](https://www.jiemian.com/pro/lists/15.html) |
| ------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| 12                                                      | 20                                                       | 21                                                    | 13                                                        | 14                                                    | 15                                                    |

| [金股挖掘](https://www.jiemian.com/pro/lists/16.html) | [调研早知道](https://www.jiemian.com/pro/lists/17.html) | [研报新知](https://www.jiemian.com/pro/lists/18.html) | [大势侦察](https://www.jiemian.com/pro/lists/1.html) | [市场风向标](https://www.jiemian.com/pro/lists/19.html) |
| ----------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| 16                                                    | 17                                                      | 18                                                    | 1                                                    | 19                                                      |`,
};

async function handler(ctx: Context): Promise<Data> {
    const { id } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const currentUrl = `https://www.jiemian.com/pro/lists/${id}.html`;
    const [pageResponse, listResponse] = await Promise.all([
        ofetch(currentUrl),
        ofetch<string>('https://a.jiemian.com/index.php', {
            query: {
                m: 'newLists',
                a: 'loadMore',
                tid: id,
                page: 1,
                tpl: 'sub-card',
                cid: '',
                repeat: '',
                list_type: 'pay',
            },
        }),
    ]);

    const { html } = JSON.parse(listResponse.slice(listResponse.indexOf('(') + 1, listResponse.lastIndexOf(')')));
    const list = parseCardList(html);

    const items = await Promise.all(list.slice(0, limit).map((item) => fetchArticle(item)));

    return {
        item: items,
        ...feedMeta(load(pageResponse), currentUrl),
    };
}
