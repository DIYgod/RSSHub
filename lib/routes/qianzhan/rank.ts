// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const type = ctx.req.param('type') === 'week' ? 1 : 2;
    const rootUrl = 'https://www.qianzhan.com/analyst/';

    const response = await got(rootUrl);
    const $ = load(response.data);
    const links = $(`#div_hotlist ul[idx='${type}'] a`).map((_, item) => $(item).attr('href'));

    const items = await Promise.all(
        links.map((_, item) =>
            cache.tryGet(item, async () => {
                const detailResponse = await got(item);
                const $ = load(detailResponse.data);
                const description = $('#divArtBody').html();
                const title = $('#h_title').text();
                const pubDate = timezone(parseDate($('#pubtime_baidu').text().split('• ')[1], 'YYYY-MM-DD HH:mm:ss'), +8);
                const author = $('.bljjxue').text().match(/\S+/)[0];
                return {
                    title,
                    link: item,
                    description,
                    pubDate,
                    author,
                    category: $('meta[name="Keywords"]').attr('content').split(','),
                };
            })
        )
    );

    ctx.set('data', {
        title: `前瞻经济学人 - ${type === 1 ? '周排行' : '月排行'}`,
        link: rootUrl,
        item: items,
    });
};
