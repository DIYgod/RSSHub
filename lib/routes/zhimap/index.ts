import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:categoryUuid?/:recommend?',
    categories: ['study'],
    example: '/zhimap/820156a42e9a490796c7fd56916aa95b/1',
    parameters: {
        categoryUuid: '分类 uuid，见下表，默认为 33b67d1bad1d4e37812f71d42764af34',
        recommend: '1 为按推荐排序，0 为按最新排序，默认为 0',
    },
    name: '导图社区导图更新',
    maintainers: ['laampui'],
    description: `| 热门                             | 学科                             | 学习                             | 语言                             | 工作                             | 提升                             | 生活                             | 互联网                           | 教育                             | 其他                             | 行业                             | 服务发布                         | 医疗                             |
| -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- |
| 33b67d1bad1d4e37812f71d42764af34 | 9434268e893a46aa9a1a231059849984 | 820156a42e9a490796c7fd56916aa95b | 959c81f606ca495c882c7e461429eb2a | 5af4bca5496e4733a2d582690627e25f | 5300988dff564756b5d462cea8a865b7 | 02fdcc2ab6374bc6b9b9717e70c87723 | 437d434fe9eb410a94dcefb889994e2b | 9747cbf78f96492c973aa6ab23925eee | d4c3a92a9cf64da7b187763211dc6ff6 | 58231ab9cef34af7819c3f6e2160c007 | 73d89972bee0457997c983d7fca19f9f | 853ce8b3a4c24b87a03f66af95c5e06c |`,
    handler,
};

const title = {
    '02fdcc2ab6374bc6b9b9717e70c87723': '生活',
    '5af4bca5496e4733a2d582690627e25f': '工作',
    '33b67d1bad1d4e37812f71d42764af34': '热门',
    '73d89972bee0457997c983d7fca19f9f': '服务发布',
    '437d434fe9eb410a94dcefb889994e2b': '互联网',
    '853ce8b3a4c24b87a03f66af95c5e06c': '医疗',
    '959c81f606ca495c882c7e461429eb2a': '语言',
    '9747cbf78f96492c973aa6ab23925eee': '教育',
    '58231ab9cef34af7819c3f6e2160c007': '行业',
    '820156a42e9a490796c7fd56916aa95b': '学习',
    '5300988dff564756b5d462cea8a865b7': '提升',
    '9434268e893a46aa9a1a231059849984': '学科',
    d4c3a92a9cf64da7b187763211dc6ff6: '其他',
};

const renderTree = (nodes) =>
    nodes?.length
        ? `<ul>${nodes
              .toSorted((a, b) => a.siblingOrder - b.siblingOrder)
              .map((node) => `<li>${node.title}${node.content ?? ''}${renderTree(node.children)}</li>`)
              .join('')}</ul>`
        : '';

async function handler(ctx: Context) {
    const { categoryUuid = '33b67d1bad1d4e37812f71d42764af34', recommend = 0 } = ctx.req.param();

    const response = await ofetch(`https://zhimap.com/restful/pub/publication/list?categoryUuid=${categoryUuid}&recommend=${recommend}&page=0&size=10`);

    const item = response.data.content.map((item) => ({
        author: item.author.nickname,
        title: item.publicationInfo.abstracts,
        description: renderTree(item.mindMap.trees),
        pubDate: parseDate(item.mindMap.createTime),
        link: `https://zhimap.com/mmap/${item.mindMap.uuid}`,
    }));

    return {
        title: `Zhimap 知识导图社区 - ${title[categoryUuid]}`,
        link: 'https://zhimap.com/gallery',
        item,
    };
}
