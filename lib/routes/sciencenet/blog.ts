// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'recommend';
    const time = ctx.req.param('time') ?? '5';
    const sort = ctx.req.param('sort') ?? '1';

    const rootUrl = 'http://blog.sciencenet.cn';
    const currentUrl = `${rootUrl}/blog.php?mod=${type}&type=list&op=${time}&ord=${sort}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    let items = $('tr td a[title]')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
                pubDate: new Date(item.next().text()).toUTCString(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));

                item.author = content('.xs2').text();
                item.description = content('#blog_article').html();
                item.pubDate = timezone(parseDate(content('.xg1').eq(5).text()), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '科学网 - 精选博文',
        link: currentUrl,
        item: items,
    });
};
