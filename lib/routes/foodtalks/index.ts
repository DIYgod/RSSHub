import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { namespace } from './namespace';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/',
    categories: namespace.categories,
    example: '/foodtalks',
    radar: [
        {
            source: ['www.foodtalks.cn'],
        },
    ],
    name: 'FoodTalks global food information network',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.foodtalks.cn',
};

function processItems(list: any[], fullTextApi: string) {
    return Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await ofetch(fullTextApi.replace('{id}', item.id), {
                        headers: {
                            referrer: 'https://www.foodtalks.cn/',
                            method: 'GET',
                        },
                    });
                    item.description = response.data.content;
                    return item;
                } catch (error) {
                    logger.error(`Error fetching full text for ${item.link}:`, error);
                    return item;
                }
            })
        )
    );
}

async function handler(ctx) {
    const limit = ctx.req.query('limit') || 15;
    const url = `https://api-we.foodtalks.cn/news/news/page?current=1&size=${limit}&isLatest=1&language=ZH`;
    const response = await ofetch(url, {
        headers: {
            referrer: 'https://www.foodtalks.cn/',
            method: 'GET',
        },
    });
    const records = response.data.records;

    const list = records.map((item) => ({
        title: item.title,
        pubDate: new Date(item.publishTime),
        link: `https://www.foodtalks.cn/news/${item.id}`,
        category: item.parentTagCode === 'category' ? item.tagCode : item.parentTagCode,
        author: item.author === null ? item.sourceName : item.author,
        id: item.id,
        image: item.coverImg,
    }));

    const fullTextApi = 'https://api-we.foodtalks.cn/news/news/{id}?language=ZH';
    const items = await processItems(list, fullTextApi);

    return {
        title: namespace.name,
        description: namespace.description,
        link: 'https://' + namespace.url,
        item: items,
        image: 'https://www.foodtalks.cn/static/img/news-site-logo.7aaa5463.svg',
    };
}
