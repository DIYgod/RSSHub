import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/philo',
    categories: ['university'],
    example: '/ecnu/philo',
    radar: [
        {
            source: ['www.philo.ecnu.edu.cn'],
            target: '/philo',
        },
    ],
    name: '哲学系通知公告',
    maintainers: ['ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'http://www.philo.ecnu.edu.cn/';

        const response = await got(`${baseUrl}tzggw/list.htm`);
        const $ = load(response.data);
        const links = $('ul.data-list2 > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('span').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('a').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data } = await got(item.link);
                    const $ = load(data);
                    item.description = $('div.wp_articlecontent')?.html()?.replaceAll('src="/', `src="${baseUrl}/`)?.replaceAll('href="/', `href="${baseUrl}/`)?.trim();
                    return item;
                })
            )
        );

        return {
            title: '哲学系通知公告',
            link: 'http://www.philo.ecnu.edu.cn/tzggw/list.htm',
            item: items,
        };
    },
};
