import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dx',
    categories: ['university'],
    example: '/ecnu/dx',
    radar: [
        {
            source: ['dx.ecnu.edu.cn'],
            target: '/dx',
        },
    ],
    name: '大夏书院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://dx.ecnu.edu.cn/';

        const response = await got(`${baseUrl}xydt/list.htm`);
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
                    item.description = $('div.read')?.html()?.replaceAll('src="/', `src="${baseUrl}/`)?.replaceAll('href="/', `href="${baseUrl}/`)?.trim();
                    return item;
                })
            )
        );

        return {
            title: '大夏书院通知公告',
            link: 'https://dx.ecnu.edu.cn/xydt/list.htm',
            item: items,
        };
    },
};
