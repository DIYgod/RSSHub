// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.cast.org.cn';

export default async (ctx) => {
    const { column = 457 } = ctx.req.param();
    const { limit = 10 } = ctx.req.query();
    const link = `${baseUrl}/col/col${column}/index.html`;
    const { data: response } = await got.post(`${baseUrl}/module/web/jpage/dataproxy.jsp`, {
        searchParams: {
            startrecord: 1,
            endrecord: limit,
            perpage: limit,
        },
        form: {
            col: 1,
            appid: 1,
            webid: 1,
            path: '/',
            columnid: column,
            sourceContentType: 1,
            unitid: 335,
            webname: '中国科学技术协会',
            permissiontype: 0,
        },
    });

    const $ = load(response, {
        xml: {
            xmlMode: true,
        },
    });

    const pageTitle = await cache.tryGet(link, async () => {
        const { data: response } = await got(link);
        const $ = load(response);
        return $('head title').text();
    });

    const list = $('record')
        .toArray()
        .map((item) => {
            item = load($(item).html(), null, false);
            const a = item('a').first();
            return {
                title: a.text(),
                pubDate: parseDate(item('.list-data').text().trim(), 'DDYYYY/MM'),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('#zoom').html();
                item.pubDate = timezone(parseDate($('meta[name=PubDate]').attr('content'), 'YYYY-MM-DD HH:mm'), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: pageTitle,
        link,
        image: 'https://www.cast.org.cn/favicon.ico',
        item: items,
    });
};
