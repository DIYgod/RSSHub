import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/homepage',
    categories: ['other'],
    example: '/ghxi/homepage',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.ghxi.com'],
        },
    ],
    name: '果核剥壳网-首页新贴',
    maintainers: ['asqwe1'],
    handler: async () => {
        const response = await ofetch(`https://www.ghxi.com/`);
        const $ = load(response);
        const items = $('#modules-4 > div > div.tab-wrap.active > ul > li > div.item-content')
            // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
            .toArray()
            // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const p = item.find('p').first();
                return {
                    title: a.text(),
                    link: String(a.attr('href')),
                    content: p.text(),
                };
            });
        // 在此处编写路由处理函数
        return {
            // 源标题
            title: `果核剥壳网-首页新贴`,
            // 源链接
            link: `https://www.ghxi.com/`,
            // 源文章
            item: items,
        };
    },
};