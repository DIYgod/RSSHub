import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache'; // 导入缓存工具
import { namespace } from './namespace';
import logger from '@/utils/logger';

async function processItems(list, fullTextApi) {
    try {
        // 直接将 Promise 结果赋值给 list
        await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(fullTextApi.replace('{id}', item.id), {
                        headers: {
                            referrer: 'https://www.foodtalks.cn/',
                            method: 'GET',
                        },
                    });
                    item.description = response.data.content;
                    return item;
                })
            )
        );

        // 成功时的逻辑处理
        logger.info('All items processed successfully!');
    } catch (error) {
        // 捕获和处理错误
        logger.error('Error occurred while processing items:', error);
    }
}

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

async function handler() {
    const url = 'https://api-we.foodtalks.cn/news/news/page?current=1&size=15&isLatest=1&language=ZH';
    const response = await ofetch(url, {
        headers: {
            referrer: 'https://www.foodtalks.cn/',
            method: 'GET',
        },
    });
    const records = response.data.records;

    // 获取除了全文的信息
    const list = records.map((item) => ({
        title: item.title,
        pubDate: new Date(item.publishTime),
        link: `https://www.foodtalks.cn/news/${item.id}`,
        category: item.parentTagCode === 'category' ? item.tagCode : item.parentTagCode,
        author: item.author === null ? item.sourceName : item.author,
        id: item.id,
        image: item.coverImg,
    }));

    // 获取全文
    const fullTextApi = 'https://api-we.foodtalks.cn/news/news/{id}?language=ZH';

    // 返回 processItems 的 Promise
    return processItems(list, fullTextApi).then(() =>
        // 返回一个 Data
         ({
            title: namespace.name,
            description: namespace.description,
            link: 'https://' + namespace.url,
            item: list,
            image: 'https://www.foodtalks.cn/static/img/news-site-logo.7aaa5463.svg',
        })
    );
}
