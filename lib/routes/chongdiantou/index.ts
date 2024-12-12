import { Route } from '@/types';
import { namespace } from './namespace';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import logger from '@/utils/logger';

async function getPosts() {
    const cacheKey = 'chongdiantou_posts';
    try {
        // 尝试从缓存中获取数据，如果没有缓存则从 API 获取
        const data = await cache.tryGet(cacheKey, async () => {
            const response = await ofetch('https://www.chongdiantou.com/wp-json/wp/v2/posts?_embed&per_page=10', {
                headers: {
                    method: 'GET',
                },
            });
            return response.map((post) => ({
                title: post.title.rendered,
                link: post.link,
                pubDate: new Date(post.date),
                category: post._embedded['wp:term'][0].map((term) => term.name).join(', '),
                description: post.content.rendered,
                author: post._embedded.author[0].name,
                image: post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : '',
            }));
        });

        return data;
    } catch (error) {
        logger.error('Error fetching posts:', error);
        return [];
    }
}

export const route: Route = {
    path: '/',
    categories: namespace.categories,
    example: '/chongdiantou',
    radar: [
        {
            source: ['www.chongdiantou.com'],
        },
    ],
    name: '充电头网',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.chongdiantou.com',
};

async function handler() {
    const items = await getPosts();

    return {
        title: '充电头网 - 最新资讯',
        description: '充电头网新闻资讯',
        link: 'https://www.chongdiantou.com/',
        image: 'https://static.chongdiantou.com/wp-content/uploads/2021/02/2021021806172389.png',
        item: items,
    };
}
