import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const base = 'https://jwc.qdu.edu.cn/';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${base}jwtz.htm`,
    });

    const $ = load(response.data);
    const list = $('.notice_item').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('.active').text();
            const itemDate = item.find('span').text();
            const path = item.find('.active').attr('href');
            let itemUrl = '';
            itemUrl = path.startsWith('http') ? path : base + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                if (path.startsWith('http')) {
                    description = itemTitle;
                } else {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description =
                        $('title').text() === '系统提示'
                            ? itemTitle // 内网限制访问内容，仅返回标题
                            : $('.v_news_content').html().trim();
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.set('data', {
        title: '青岛大学 - 教务处通知',
        link: `${base}jwtz.htm`,
        description: '青岛大学 - 教务处通知',
        item: items,
    });
};
