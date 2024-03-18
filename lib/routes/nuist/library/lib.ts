import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseTitle = '南京信息工程大学图书馆通知';
const baseUrl = 'https://lib.nuist.edu.cn';

export const route: Route = {
    path: '/lib',
    radar: [
        {
            source: ['lib.nuist.edu.cn/', 'lib.nuist.edu.cn/index/tzgg.htm'],
        },
    ],
    name: 'Unknown',
    maintainers: ['gylidian'],
    handler,
    url: 'lib.nuist.edu.cn/',
};

async function handler() {
    const link = baseUrl + '/index/tzgg.htm';

    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list2 li')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').attr('title'),
                category: '通知',
                link: new URL(item.find('a').attr('href'), link).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('#vsb_content').html();
                item.pubDate = parseDate($('.date').find('span').eq(0).text(), 'YYYY年MM月DD日');

                return item;
            })
        )
    );

    return {
        title: baseTitle,
        link,
        item: items,
    };
}
