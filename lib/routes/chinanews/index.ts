// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const rootUrl = 'https://www.chinanews.com.cn';

export default async (ctx) => {
    const currentUrl = `${rootUrl}/scroll-news/news1.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const list = $('a', '.dd_bt')
        .map((_, item) => ({
            link: rootUrl + $(item).attr('href'),
            title: $(item).text(),
        }))
        .get()
        .slice(0, ctx.req.query('limit') ? (Number.parseInt(ctx.req.query('limit')) > 125 ? 125 : Number.parseInt(ctx.req.query('limit'))) : 50);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                content('.adInContent').remove();
                if (content('div.content_desc').length > 0) {
                    item.description = content('div.content_desc').html();
                    item.author = content('a.source').text();
                    const info = content('p', '.left').text().trim().slice(5).split(' ');
                    item.author = info[2].trim();
                    item.pubDate = timezone(parseDate(info[0] + info[1], 'YYYY年MM月DD日HH:mm'), +8);
                } else if (content('div.t3').length > 0) {
                    item.description = content('div.t3').html();
                    const info = content('div[style="text-align:right;font-size:12px;"]').text().slice(5).split(' ');
                    item.author = info[2];
                    item.pubDate = timezone(parseDate(info[0] + info[1], 'YYYY-MM-DDHH:mm'), +8);
                } else {
                    item.description = content('div.left_zw').html();
                    const info = content('div.left-t')
                        .contents()
                        .filter(function () {
                            return this.type === 'text';
                        })
                        .text()
                        .split('　');
                    item.pubDate = timezone(parseDate(info[0], 'YYYY年MM月DD日 HH:mm'), +8);
                    item.author = info[1] + content('a.source').text();
                }
                return item;
            })
        )
    );
    ctx.set('data', {
        title: '中国新闻网',
        link: currentUrl,
        description: '中国新闻网（简称“中新网”），由中国新闻社主办，为中央重点新闻网站。',
        language: 'zh-cn',
        item: items,
    });
};
