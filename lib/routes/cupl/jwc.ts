import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
// import cache from '@/utils/cache';

export const route: Route = {
    path: '/jwc',
    url: 'jwc.cupl.edu.cn/index/tzgg.htm',
    categories: ['university'],
    example: '/cupl/jwc',
    description: '中国政法大学教务处通知公告',
    name: '教务处通知公告',
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
            source: ['jwc.cupl.edu.cn/index/tzgg.htm', 'jwc.cupl.edu.cn/'],
            target: '/jwc',
        },
    ],
    maintainers: ['Fgju'],
    handler: async (/* ctx*/) => {
        const host = 'https://jwc.cupl.edu.cn/';
        const response = await ofetch(host + 'index/tzgg.htm');
        const $ = load(response);

        const list = $('li[id^=line_u8_]')
            .toArray()
            .map((elem) => {
                const elem_ = $(elem);
                const a = elem_.find('a');
                return {
                    link: a[1].attribs.href,
                    title: $(a[1]).text(),
                    pubDate: parseDate(elem_.find('span').text(), 'YYYY-MM-DD'),
                    category: $(a[0]).text().slice(0, -1),
                    description: '',
                };
            });
        /*
        const items = await Promise.all(
            list.map((item) => {
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(host + item.link.slice(3));
                    const $ = load(response);
                    const content = $('.form[name=_newscontent_fromname]').html();
                    item.description = content ?? '';
                    return item;
                }
                )
            })
        );
        */
        return {
            title: '通知公告',
            link: 'https://jwc.cupl.edu.cn/index/tzgg.htm',
            description: '中国政法大学教务处通知公告',
            language: 'zh-CN',
            item: list,
        };
    },
};
