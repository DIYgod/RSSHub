import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.sc.sdu.edu.cn/';
const typelist = ['通知公告', '学术动态', '本科教育', '研究生教育'];
const urlList = ['tzgg.htm', 'kxyj/xsyg.htm', 'rcpy/bkjy.htm', 'rcpy/yjsjy.htm'];

export default async (ctx) => {
    const type = ctx.req.param('type') ? Number.parseInt(ctx.req.param('type')) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = load(response.data);

    let item = $('.newlist01 li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            let link = a.attr('href');
            link = new URL(link, host).href;
            return {
                title: a.text().trim(),
                link,
                pubDate: parseDate(e.find('.date').text().trim()),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    item.title = $('h3').text();
                    item.author =
                        $('.pr')
                            .text()
                            .trim()
                            .match(/作者：(.*)/)[1] || '山东大学软件学院';
                    $('h3, .pr').remove();
                    item.description = $('.content').html();

                    return item;
                } catch {
                    // intranet oa.sdu.edu.cn
                    return item;
                }
            })
        )
    );

    ctx.set('data', {
        title: `山东大学软件学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    });
};
