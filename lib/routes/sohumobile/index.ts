import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/limit',
    categories: ['traditional-media'],
    example: '/sohumobile/limit',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.sohu.com/limit'],
            target: '/limit',
        },
    ],
    name: '手机搜狐网-新闻',
    maintainers: ['asqwe1'],
    handler: async () => {
        const response = await ofetch(`https://m.sohu.com/limit`);
        const $ = load(response);
        const items = $('.content-left  section > div.f')
            // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
            .toArray()
            // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                return {
                    title: a.text(),
                    link: String(a.attr('href')),
                };
            });
        // 在此处编写路由处理函数
        return {
            // 源标题
            title: `手机搜狐新闻`,
            // 源链接
            link: `https://m.sohu.com/limit`,
            // 源文章
            item: items,
        };
    },
};