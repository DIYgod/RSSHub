import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cee',
    categories: ['university'],
    example: '/ecnu/cee',
    radar: [
        {
            source: ['cee.ecnu.edu.cn'],
            target: '/cee',
        },
    ],
    name: '通信与电子工程学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://cee.ecnu.edu.cn/';

        const response = await got(`${baseUrl}tzgg_4170/list.htm`);
        const $ = load(response.data);
        const links = $('ul.news_list.list2 > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.news_meta').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('a').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data } = await got(item.link);
                    const $ = load(data);
                    item.description = $('div.entry div.read')?.html()?.replaceAll('src="/', `src="${baseUrl}/`)?.replaceAll('href="/', `href="${baseUrl}/`)?.trim();
                    return item;
                })
            )
        );

        return {
            title: '通信与电子工程学院通知公告',
            link: 'https://cee.ecnu.edu.cn/tzgg_4170/list.htm',
            item: items,
        };
    },
};
