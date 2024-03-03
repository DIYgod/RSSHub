// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const link = 'https://www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp';

    const { data: response } = await got(link);
    const $ = load(response);
    const list = $('.tr_main_value_odd')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a');
            return {
                title: title.attr('title'),
                link: `https://www.suzhou.gov.cn${title.attr('href')}`,
                pubDate: timezone(parseDate(item.find('td:nth-child(3)').text().trim()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.article-content').html();
                item.author = $('dd.addWidth:nth-child(3) div').text().trim();
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content'), 'YYYY-MM-DD HH:mm:ss'), 8) : item.pubDate;
                item.category = $('.OwnerDept font')
                    .toArray()
                    .map((item) => $(item).text().trim());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '苏州市政府 - 政策公开文件',
        link,
        item: items,
    });
};
