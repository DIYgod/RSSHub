// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const pcodeJiguan = ctx.req.param('pcodeJiguan');
    const link = 'http://sousuo.gov.cn/list.htm';
    const res = await got(link, {
        searchParams: {
            n: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20,
            sort: 'pubtime',
            t: 'paper',
            pcodeJiguan: pcodeJiguan ?? '',
        },
    });
    const $ = load(res.data);

    const list = $('body > div.dataBox > table > tbody > tr')
        .slice(1)
        .toArray()
        .map((elem) => {
            elem = $(elem);
            return {
                title: elem.find('td:nth-child(2) > a').text(),
                link: elem.find('td:nth-child(2) > a').attr('href'),
                pubDate: timezone(parseDate(elem.find('td:nth-child(5)').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const contentData = await got(item.link);
                const $ = load(contentData.data);
                item.description = $('#UCAP-CONTENT').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '最新文件 - 中国政府网',
        link: res.url,
        item: items,
    });
};
