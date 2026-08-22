import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['social-media'],
    example: '/dgtle',
    name: '首页',
    maintainers: ['Erriy'],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.dgtle.com/home/getItemsList', {
        query: {
            page: 1,
            adv_flag: 0,
            left_type: '',
            last_id: 0,
        },
    });

    const articleItems = response.data.dataList.flat().filter((item) => item.type === 1 || item.type === 4);

    const items = await Promise.all(
        articleItems.map(async (item) => {
            const isArticle = item.type === 1;
            const dlink = isArticle ? `https://opser.api.dgtle.com/v1/article/view/${item.aid}` : `https://opser.api.dgtle.com/v1/feeds/inst/${item.aid}`;

            return await cache.tryGet(dlink, async () => {
                const detail = await ofetch(dlink);
                return {
                    title: isArticle ? item.title : item.summary,
                    description: isArticle ? detail.content : detail.content + detail.imgs_url.map((dimg) => `<img src="${dimg.path.split('?', 1)[0]}">`).join(''),
                    pubDate: parseDate(item.send_at * 1000),
                    link: isArticle ? `https://www.dgtle.com/article-${item.aid}-1.html` : `https://www.dgtle.com/inst-${item.aid}-1.html`,
                    category: isArticle ? '文章' : '兴趣动态',
                    author: item.user_name,
                };
            });
        })
    );

    return {
        title: '数字尾巴 - 首页',
        link: 'https://www.dgtle.com',
        description: '数字尾巴首页内容',
        item: items,
    };
}
