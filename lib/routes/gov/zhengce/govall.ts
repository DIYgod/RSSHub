// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const advance = ctx.req.param('advance');
    const link = `http://sousuo.gov.cn/list.htm`;
    const params = new URLSearchParams({
        n: 20,
        t: 'govall',
        sort: 'pubtime',
        advance: 'true',
    });
    const query = `${params.toString()}&${advance}`;
    const res = await got.get(link, {
        searchParams: query.replaceAll(/([\u4E00-\u9FA5])/g, (str) => encodeURIComponent(str)),
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
                let description = '';
                try {
                    const contentData = await got(item.link);
                    const $ = load(contentData.data);
                    description = $('#UCAP-CONTENT').html();
                } catch {
                    description = '文章已被删除';
                }
                item.description = description;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '信息稿件 - 中国政府网',
        link: `${link}?${query}`,
        item: items,
    });
};
