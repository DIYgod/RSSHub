import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zx/xingnew',
    categories: ['travel'],
    example: '/zx/xingnew',
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
            source: ['chnmuseum.cn/zx/xingnew'],
            target: '/zx/xingnew',
        },
    ],
    name: '资讯要闻',
    maintainers: ['ShabbyWhineYear'],
    handler: async () => {
        const response = await ofetch('https://www.chnmuseum.cn/zx/xingnew/');
        const $ = load(response);

        const list = $('ul.cj_xushuliebao_list li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a');
                const dateText = item.find('span.date').text();

                return {
                    title: a.attr('title') || a.text(),
                    link: new URL(a.attr('href'), 'https://www.chnmuseum.cn/zx/xingnew/').href,
                    pubDate: timezone(parseDate(dateText, 'YYYY/MM/DD'), +8),
                    // description: a.attr('title') || a.text(),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    // 选择类名为“comment-body”的第一个元素
                    item.description = $('.cj_xw_cong').first().html();

                    // 上面每个列表项的每个属性都在此重用，
                    // 并增加了一个新属性“description”
                    return item;
                })
            )
        );

        return {
            // 源标题
            title: '中国国家博物馆资讯要闻',
            // 源链接
            link: 'https://www.chnmuseum.cn/zx/xingnew/',
            // 源文章
            item: items,
        };
    },
};
