import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/zx/xwzt',
    categories: ['travel'],
    example: '/zx/xwzt',
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
            source: ['chnmuseum.cn/zx/xwzt'],
            target: '/zx/xwzt',
        },
    ],
    name: '资讯专题',
    maintainers: ['ShabbyWhineYear'],
    handler: async () => {
        const response = await ofetch('https://www.chnmuseum.cn/zx/xwzt/');
        const $ = load(response);

        const items = $('ul.cj_hd_zhanh li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('div.cj_hd_biaoti a').first();

                return {
                    title: a.attr('title') || a.text(),
                    link: new URL(a.attr('href'), 'https://www.chnmuseum.cn').href,
                };
            });

        // const items = await Promise.all(
        //     list.map((item) =>
        //         cache.tryGet(item.link, async () => {
        //             const response = await ofetch(item.link);
        //             const $ = load(response);
        //
        //             // 选择类名为“comment-body”的第一个元素
        //             item.description = $('.cj_xw_cong').first().html();
        //
        //             // 上面每个列表项的每个属性都在此重用，
        //             // 并增加了一个新属性“description”
        //             return item;
        //         })
        //     )
        // );

        return {
            // 源标题
            title: '中国国家博物馆资讯专题',
            // 源链接
            link: 'https://www.chnmuseum.cn/zx/xwzt/',
            // 源文章
            item: items,
        };
    },
};
