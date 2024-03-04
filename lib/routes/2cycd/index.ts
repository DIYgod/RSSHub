// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const iconv = require('iconv-lite');

// http://www.2cycd.com/forum.php?mod=forumdisplay&fid=43&orderby=dateline

export default async (ctx) => {
    const fid = ctx.req.param('fid') ?? '43';
    const sort = ctx.req.param('sort') ?? 'dateline';

    const rootUrl = 'http://www.2cycd.com/forum.php?mod=forumdisplay';
    const currentUrl = `${rootUrl}&fid=${fid}&orderby=${sort}`;

    const response = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    const list = $('tbody[id^="normalthread_"]')
        .map((_, item) => {
            item = $(item);
            const xst = item.find('a.s.xst');
            const author = item.find('td.by cite a').eq(0).text();
            return {
                title: xst.text(),
                link: xst.attr('href'),
                author,
            };
        })
        .get();
    // console.log(list);
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));
                const first_post = content('td[id^="postmessage_"]').first();
                const dateobj = content('em[id^="authorposton"]').first();
                item.description = first_post.html();
                item.pubDate = timezone(parseDate(dateobj.find('span').attr('title'), 'YYYY-M-D HH:mm:ss'), +8);

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
