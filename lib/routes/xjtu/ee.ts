// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '1124';
    const rootUrl = `http://ee.xjtu.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${id}`;
    const baseUrl = 'http://ee.xjtu.edu.cn';

    const list_response = await got(rootUrl);
    const $ = load(list_response.data);

    const feed_title = $('span.windowstyle67278', "div[class='list_right fr']").text().trim();

    const list = $("div[class='list_right fr'] ul li")
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const date = parseDate(item.find('span').text());
            return {
                title: a.text(),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: timezone(date, +8),
            };
        })
        .get();

    ctx.set('data', {
        title: `西安交通大学电气学院 - ${feed_title}`,
        link: baseUrl,
        item: await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const res = await got(item.link);
                    const content = load(res.data);
                    item.title = content('tr td[class^=titlestyle]').text();
                    item.description = content('td.contentstyle67362', 'form').html();
                    return item;
                })
            )
        ),
    });
};
