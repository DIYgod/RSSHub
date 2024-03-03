// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://xd.x6d.com';

export default async (ctx) => {
    const { id = 'latest' } = ctx.req.param();

    const currentUrl = id === 'latest' ? baseUrl : `${baseUrl}/html/${id}.html`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    $('i.rj').remove();

    const query =
        id === 'latest'
            ? $('#newslist ul')
                  .eq(0)
                  .find('li')
                  .not('.addd')
                  .find('a')
                  .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 22)
            : $('a.soft-title').slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10);

    const list = query.toArray().map((item) => {
        item = $(item);
        return {
            title: item.text(),
            link: `${baseUrl}${item.attr('href')}`,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);

                item.description = content('div.article-content').html();
                item.pubDate = timezone(parseDate(content('time').text()), 8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `小刀娱乐网 - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    });
};
