import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/article',
    categories: ['new-media'],
    example: '/baijing/article',
    url: 'www.baijing.cn/article/',
    name: '资讯',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const apiUrl = 'https://www.baijing.cn/index/ajax/get_article/';
    const response = await ofetch(apiUrl);
    const data = response.data.article_list;

    const list = data.map((item) => ({
        title: item.title,
        link: `https://www.baijing.cn/article/${item.id}`,
        author: item.user_info.user_name,
        category: item.topic?.map((t) => t.title),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);

                const $ = load(response);
                item.description = $('.content').html();
                item.pubDate = parseDate($('.timeago').text());

                return item;
            })
        )
    );

    return {
        title: '白鲸出海 - 资讯',
        link: 'https://www.baijing.cn/article/',
        item: items,
    };
}
