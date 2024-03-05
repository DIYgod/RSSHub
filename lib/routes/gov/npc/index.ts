// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const caty = ctx.req.param('caty');
    // 主页
    const baseurl = `http://www.npc.gov.cn/npc/c2/${caty}/`;
    const response = await got(baseurl);
    const data = response.data;
    const $ = load(data);
    const title = $('title').text();
    // 获取每条的链接
    const links = $('.clist a')
        .toArray()
        .map((item) => new URL($(item).attr('href'), baseurl).href);
    // 获取标题、日期、内容
    const items = await Promise.all(
        links.map((link) =>
            cache.tryGet(link, async () => {
                const response = await got(link);
                const data = response.data;
                const $ = load(data);
                const title = $('title').text().replace('_中国人大网', '');
                const time = $('script:contains("fbrq")')
                    .text()
                    .match(/fbrq = "(.*?)"/)[1];
                const description = $('#Zoom').html();

                return {
                    title,
                    link,
                    description,
                    pubDate: timezone(parseDate(time, 'YYYY年MM月DD日 HH:mm'), +8),
                };
            })
        )
    );
    // 整合
    ctx.set('data', {
        title,
        link: baseurl,
        description: title,
        item: items,
    });
};
