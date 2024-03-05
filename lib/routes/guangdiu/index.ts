// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export default async (ctx) => {
    const query = ctx.req.param('query') ?? '';
    const url = query === 'c=us' ? `${host}/?c=us` : `${host}/${query ? `cate.php?${query}` : ''}`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .map((_index, item) => ({
            title: $(item).find('a.goodname').text().trim(),
            link: new URL($(item).find('div.iteminfoarea > h2 > a').attr('href'), host).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('span.latesttime').text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `逛丢 - ${query.includes('c=us') ? '海外' : '国内'}`,
        link: url,
        item: items,
    });
};
