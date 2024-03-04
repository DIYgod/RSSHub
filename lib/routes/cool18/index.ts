// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? 'bbs4';
    const type = ctx.req.param('type') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://www.cool18.com';
    const indexUrl = `${rootUrl}/${id}/index.php`;
    const currentUrl = `${indexUrl}${keyword ? (type ? (type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&${type}=${keyword}&submit=${type === 'type' ? '查询' : '栏目搜索'}`) : '') : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#d_list ul li, #thread_list li, .t_l .t_subject')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                link: `${rootUrl}/${id}/${a.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.title = content('title').text().replace(' - cool18.com', '');
                item.author = detailResponse.data.match(/送交者: .*>(.*)<.*\[/)[1];
                item.pubDate = parseDate(detailResponse.data.match(/于 (.*) 已读/)[1]).toUTCString();
                item.description = content('pre')
                    .html()
                    .replaceAll(/<font color="#E6E6DD">cool18.com<\/font>/g, '');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
