import type { Context } from 'hono';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { tiebaClientRequest } from './common';

export const route: Route = {
    path: '/tieba/search/:qw/:routeParams?',
    categories: ['bbs'],
    example: '/baidu/tieba/search/neuro',
    parameters: { qw: '搜索关键词', routeParams: '额外参数；请参阅以下说明和表格' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: true,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        antiCrawler: true,
    },
    name: '贴吧搜索',
    maintainers: ['JimenezLi', 'FlanChanXwO'],
    handler,
    description: `| 键           | 含义                                                       | 接受的值      | 默认值 |
| ------------ | ---------------------------------------------------------- | ------------- | ------ |
| kw           | 在名为 kw 的贴吧中搜索                                     | 任意名称 / 无 | 无     |
| only\\_thread | 只看主题帖，默认为 0 关闭                                  | 0/1           | 0      |
| rn           | 返回条目的数量                                             | 1-20          | 20     |
| sm           | 排序方式，0 为按时间顺序，1 为按时间倒序，2 为按相关性顺序 | 0/1/2         | 1      |

用例：\`/baidu/tieba/search/neuro/kw=neurosama&only_thread=1&sm=2\``,
};

async function handler(ctx: Context) {
    const { qw, routeParams } = ctx.req.param();
    const query = new URLSearchParams(routeParams);
    const kw = query.get('kw') ?? '';

    const data = await tiebaClientRequest('/c/s/searchpost', {
        word: qw,
        kw,
        pn: '1',
        rn: query.get('rn') ?? '20',
        sm: query.get('sm') ?? '1',
        only_thread: query.get('only_thread') ?? '0',
    });

    return {
        title: `${qw} - ${kw || '百度贴'}吧搜索`,
        link: `https://tieba.baidu.com/f/search/res?ie=utf-8&qw=${encodeURIComponent(qw)}${kw ? `&kw=${encodeURIComponent(kw)}` : ''}`,
        item: data.post_list.map((post) => ({
            title: post.title,
            description: `<p>${post.content}</p><p>贴吧：${post.fname}</p>`,
            author: post.author.name_show,
            pubDate: parseDate(post.time, 'X'),
            link: `https://tieba.baidu.com/p/${post.tid}?pid=${post.pid}#${post.pid}`,
        })),
    };
}
