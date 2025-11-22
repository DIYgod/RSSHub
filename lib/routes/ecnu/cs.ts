import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cs',
    categories: ['university'],
    example: '/ecnu/cs',
    radar: [
        {
            source: ['cs.ecnu.edu.cn'],
            target: '/cs',
        },
    ],
    name: '计算机科学与技术学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://cs.ecnu.edu.cn/';

        const response = await got(`${baseUrl}19867/list.htm`);
        const $ = load(response.data);
        const links = $('div#wp_news_w6 ul.data-list > li')
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
                    item.description = $('div.view-cnt')?.html()?.replaceAll('src="/', `src="${baseUrl}/`)?.replaceAll('href="/', `href="${baseUrl}/`)?.trim();
                    return item;
                })
            )
        );

        return {
            title: '计算机科学与技术学院通知公告',
            link: 'https://cs.ecnu.edu.cn/19867/list.htm',
            item: items,
        };
    },
};
