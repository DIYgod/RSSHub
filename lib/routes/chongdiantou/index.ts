import { Route } from '@/types';
import { namespace } from './namespace';
import ofetch from '@/utils/ofetch';
import logger from '@/utils/logger';

async function getPosts() {
    try {
        // Fetch data directly from the API without caching
        const response = await ofetch('https://www.chongdiantou.com/wp-json/wp/v2/posts?_embed&per_page=10', {
            headers: {
                method: 'GET',
            },
        });
        return response.map((post) => ({
            title: post.title.rendered,
            link: post.link,
            pubDate: new Date(post.date_gmt), // Use date_gmt instead of date
            category: post._embedded['wp:term'][0].map((term) => term.name).join(', '),
            description: post.content.rendered,
            author: post._embedded.author[0].name,
            image: post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : '',
        }));
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
    name: '最新资讯',
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
