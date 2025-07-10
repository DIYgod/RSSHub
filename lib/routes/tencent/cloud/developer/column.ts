import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const PAGE = 1;
const PAGE_SIZE = 20;

export const route: Route = {
    path: '/cloud/developer/column/:categoryId?',
    categories: ['programming'],
    example: '/tencent/cloud/developer/column/1',
    parameters: { categoryId: 'categoryId from page url' },
    radar: [
        {
            source: ['cloud.tencent.com/developer/column'],
        },
    ],
    name: '腾讯云开发者社区专栏',
    maintainers: ['lyling'],
    handler: async (ctx) => {
        const categoryId = ctx.req.param('categoryId') ?? 0;
        const link = `https://cloud.tencent.com/developer/api/home/article-list`;
        const response = await ofetch(link, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                classifyId: categoryId,
                page: PAGE,
                pagesize: PAGE_SIZE,
                type: '',
            },
        });

        const items = response.list.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章链接
            link: `https://cloud.tencent.com/developer/article/${item.articleId}`,
            // 文章正文
            description: item.summary,
            // 文章发布日期
            pubDate: parseDate(item.createTime * 1000),
            // 如果有的话，文章作者
            author: item.author.nickname,
            // 如果有的话，文章分类
            category: item.tags.map((tag) => tag.tagName),
        }));

        const classify = await findClassifyById(categoryId);

        const title = classify ? classify.name : '';
        const description = `${title} - 腾讯云开发者社区`;

        return {
            title,
            description,
            item: items,
        };
    },
};

async function findClassifyById(id) {
    const classifylink = 'https://cloud.tencent.com/developer/api/column/get-classify-list-by-scene';
    const response = await cache.tryGet(classifylink, async () => {
        const response = await ofetch(classifylink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                scene: 0,
            },
        });
        return response;
    });

    return response.list.find((classify) => classify.id === Number(id));
}
