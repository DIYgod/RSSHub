import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const type = (filename) => filename.split('.').pop();

export const route: Route = {
    path: '/psy',
    categories: ['university'],
    example: '/ecnu/psy',
    radar: [
        {
            source: ['psy.ecnu.edu.cn'],
            target: '/psy',
        },
    ],
    name: '心理与认知科学学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://psy.ecnu.edu.cn/';

        const response = await got(`${baseUrl}tzgg/list.htm`);
        const $ = load(response.data);
        const links = $('ul.wp_article_list > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.Article_PublishDate').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('a').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (type(item.link) === 'htm') {
                        const { data } = await got(item.link);
                        const $ = load(data);
                        const $read = $('div.wp_articlecontent');
                        $read.find('img[src], a[href]').each((i, el) => {
                            const $el = $(el);
                            const attr = el.tagName === 'img' ? 'src' : 'href';
                            const val = $el.attr(attr);
                            if (val) {
                                $el.attr(attr, new URL(val, baseUrl).toString());
                            }
                        });
                        item.description = $read.html()?.trim();
                        return item;
                    } else {
                        // file to download
                        item.description = '请到原网页访问';
                        return item;
                    }
                })
            )
        );

        return {
            title: '心理与认知科学学院通知公告',
            link: 'https://psy.ecnu.edu.cn/tzgg/list.htm',
            item: items,
        };
    },
};
