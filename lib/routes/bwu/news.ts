import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/bwu/news',
    name: '通知公告',
    maintainers: ['muxinqi'],
    description: `::: warning
由于学校官网对非大陆 IP 的访问存在限制，需自行部署。
:::`,
    handler,
};

async function handler() {
    const title = '通知公告';
    const host = 'https://news.bwu.edu.cn/';
    const path = 'tzgg.htm';

    const response = await ofetch(host + path);

    const $ = load(response);
    const list = $('div[class=subPage] div ul li')
        .toArray()
        .slice(0, 25)
        .map((item) => {
            const $item = $(item);
            const aTag = $item.find('a');
            const link = new URL(aTag.attr('href')!, host).href;

            return {
                title: aTag.text(),
                link,
                guid: link,
                pubDate: timezone(parseDate($item.find('span[class=rightDate]').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('shouye_content.jsp')) {
                    return item;
                }
                const detail = await ofetch(item.link);
                const $detail = load(detail);
                const author = $detail('div[class=articleAuthor] p span').eq(1).text() || 'null';
                const authorName = author.includes(':') ? author.split(':', 2)[1].trim() : author;

                return {
                    ...item,
                    description: $detail('div[id^=vsb_content]').html(),
                    author: `xcb@bwu.edu.cn (${authorName})`,
                };
            })
        )
    );

    return {
        title: `${title} - 物院新闻`,
        link: host + path,
        description: `${title} - 北京物资学院新闻中心`,
        item: items,
    };
}
