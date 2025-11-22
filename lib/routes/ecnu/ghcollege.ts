import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const type = (filename) => filename.split('.').pop();

export const route: Route = {
    path: '/ghcollege',
    categories: ['university'],
    example: '/ecnu/ghcollege',
    radar: [
        {
            source: ['www.ghcollege.ecnu.edu.cn'],
            target: '/ghcollege',
        },
    ],
    name: '光华书院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'http://www.ghcollege.ecnu.edu.cn/';

        const response = await got(`${baseUrl}8609/list.htm`);
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
                        item.description = '请至原网页访问内容';
                        return item;
                    }
                })
            )
        );

        return {
            title: '光华书院通知公告',
            link: 'http://www.ghcollege.ecnu.edu.cn/8609/list.htm',
            item: items,
        };
    },
};
