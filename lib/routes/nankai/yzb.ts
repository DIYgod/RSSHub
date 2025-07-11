import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yzb/:type?',
    categories: ['university'],
    example: '/nankai/yzb/5509',
    parameters: { type: '栏目名（若为空则默认为“硕士招生”）' },
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
            source: ['yzb.nankai.edu.cn', 'yzb.nankai.edu.cn/:type/list.htm'],
            target: '/yzb/:type?',
        },
    ],
    name: '研究生招生网',
    maintainers: ['sddzhyc'],
    description: `| 硕士招生 | 博士招生 | 港澳台研究生最新信息 |
| -------- | -------- | -------- |
| 5509     | 2552    | 2562   |`,
    url: 'yzb.nankai.edu.cn',
    handler: async (ctx) => {
        // 从 URL 参数中获取通知分类
        const { type = '5509' } = ctx.req.param();
        const baseUrl = 'https://yzb.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
        const $ = load(response);
        const dateList = $('#wp_news_w9')
            .find('span.col_news_date')
            .toArray()
            .map((item) => $(item).text());
        const list = $('#wp_news_w9')
            .find('a[title]')
            // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
            .toArray()
            // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
            .map((a, index) => {
                a = $(a);
                let linkStr = a.attr('href');
                // 若链接不是以http开头，则加上前缀
                if (a.attr('href').startsWith('http://')) {
                    // 改为https访问
                    linkStr.replace('http://', 'https://');
                } else {
                    linkStr = `${baseUrl}${a.attr('href')}`;
                }
                return {
                    title: a.text(),
                    link: linkStr,
                    pubDate: timezone(parseDate(dateList[index]), +8), // 添加发布日期查询
                };
            });
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    item.description = $('.read').first().html();
                    // 上面每个列表项的每个属性都在此重用，
                    // 并增加了一个新属性“description”
                    return item;
                })
            )
        );
        return {
            // 源标题
            title: `南开大学研究生招生网-${$('.column-title').text()}`,
            // 源链接
            link: `${baseUrl}/${type}/list.htm`,
            // 源文章
            item: items,
        };
    },
};
