// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.ahjzu.edu.cn';
    const currentUrl = 'https://www.ahjzu.edu.cn/20/list.htm';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('#wp_news_w9')
        .find('li')
        .map((_, item) => {
            item = $(item);
            const date = item.find('.column-news-date').text();

            // 置顶链接自带http前缀，其他不带，需要手动判断
            const a = item.find('a').attr('href');
            const link = a.slice(0, 4) === 'http' ? a : rootUrl + a;
            return {
                title: item.find('a').attr('title'),
                link,
                pubDate: timezone(parseDate(date), +8),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const post = content('.wp_articlecontent').html();

                item.description = post;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '安建大-通知公告',
        description: '安徽建筑大学-通知公告',
        link: currentUrl,
        item: items,
    });
};
