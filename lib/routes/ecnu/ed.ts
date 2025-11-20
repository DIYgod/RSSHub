import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const type = (filename) => filename.split('.').pop();

export const route: Route = {
    path: '/ed',
    categories: ['university'],
    example: '/ecnu/ed',
    radar: [
        {
            source: ['ed.ecnu.edu.cn'],
            target: '/ed',
        },
    ],
    name: '教育学部通知公告',
    maintainers: ['ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://ed.ecnu.edu.cn/';

        const response = await got(`${baseUrl}45918/list.htm`);
        const $ = load(response.data);
        const links = $('ul.news_list > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.news_meta').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('a').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (type(item.link) === 'htm') {
                        try {
                            const { data } = await got(item.link);
                            const $ = load(data);
                            item.description = $('div.article')?.html()?.replaceAll('src="/', `src="${baseUrl}/`)?.replaceAll('href="/', `href="${baseUrl}/`)?.trim();
                            return item;
                        } catch {
                            // intranet
                            item.description = '请进行统一身份认证之后再访问';
                            return item;
                        }
                    } else {
                        // file to download
                        item.description = '点击认证后访问内容';
                        return item;
                    }
                })
            )
        );

        return {
            title: '教育学部通知公告',
            link: 'https://ed.ecnu.edu.cn/41465/list.htm',
            item: items,
        };
    },
};
