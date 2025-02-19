import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { Route } from '@/types';

export const route: Route = {
    path: '/jwb',
    categories: ['university'],
    example: '/bnu/jwb',
    parameters: {},
    radar: [
        {
            source: ['jwb.bnu.edu.cn'],
        },
    ],
    name: '教务部（研究生院）',
    maintainers: ['ladeng07'],
    handler,
    url: 'jwb.bnu.edu.cn/tzgg/index.htm',
};

async function handler() {
    const link = 'https://jwb.bnu.edu.cn/tzgg/index.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.article-list .boxlist ul li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: e.find('a span').text(),
                link: a.attr('href').startsWith('http') ? a.attr('href') : 'https://jwb.bnu.edu.cn' + a.attr('href').substring(2),
                pubDate: parseDate(e.find('span.fr.text-muted').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author = '北京师范大学教务部';
                item.description = $('.contenttxt').html();
                return item;
            })
        )
    );

    return {
        title: '北京师范大学教务部',
        link,
        description: '北京师范大学教务部最新通知',
        item: out,
    };
}
