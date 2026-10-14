import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface HomeItem {
    type: number;
    aid: number;
    title: string;
    summary: string;
    created_at?: number;
    user_name?: string;
}

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

    const articleItems: HomeItem[] = response.data.dataList.flat().filter((item) => item.type === 1 || item.type === 4);
    const ordered = articleItems;
    const selected = ordered;

    const items = await pMap(
        selected,
        async (item) => {
            const isArticle = item.type === 1;
            const dlink = isArticle ? `https://opser.api.dgtle.com/v1/article/view/${item.aid}` : `https://opser.api.dgtle.com/v1/feeds/inst/${item.aid}`;

            return await cache.tryGet(dlink, async () => {
                const detail = await ofetch(dlink);
                return {
                    title: isArticle ? item.title : item.summary,
                    description: isArticle ? detail.content : detail.content + detail.imgs_url.map((dimg) => `<img src="${dimg.path.split('?', 1)[0]}">`).join(''),
                    pubDate: item.created_at ? parseDate(item.created_at, 'X') : undefined,
                    link: isArticle ? `https://www.dgtle.com/article-${item.aid}-1.html` : `https://www.dgtle.com/inst-${item.aid}-1.html`,
                    category: isArticle ? '文章' : '兴趣动态',
                    author: item.user_name,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: '数字尾巴 - 首页',
        link: 'https://www.dgtle.com',
        description: '数字尾巴首页内容',
        item: items,
    };
}
