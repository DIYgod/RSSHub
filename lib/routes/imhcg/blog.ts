import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    view: ViewType.Notifications,
    example: '/imhcg',
    parameters: {},
    radar: [
        {
            source: ['infos.imhcg.cn'],
        },
    ],
    name: 'Engineering blogs',
    maintainers: ['ZiHao256', 'qzydustin'],
    handler,
    url: 'infos.imhcg.cn',
};

async function handler() {
    const response = await ofetch('https://infos.imhcg.cn/');
    const $ = load(response);
    const items = $('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a.article-title').text();
            const link = $(item).find('a.article-title').attr('href');
            const author = $(item).find('p.article-author').text();
            const time = $(item).find('p.article-time').text();
            const description = $(item).find('p.article-text').text();
            return {
                title,
                link,
                author,
                time,
                description,
            };
        });

    return {
        title: `Engineering Blogs`,
        link: 'https://infos.imhcg.cn/',
        item: items,
    };
}
