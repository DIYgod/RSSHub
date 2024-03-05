// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'http://jwgl.ouc.edu.cn/public/listSchoolNotices.action?currentPage=1&recordsPerPage=15&qtitle=';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('div.datalist table tbody tr')
        .toArray()
        .map((e) => {
            e = $(e);
            const noticeId = e
                .find('a')
                .attr('onclick')
                .match(/viewNotice\('(.+?)'\)/)[1];
            const tds = e.find('td');
            return {
                title: tds.eq(2).text(),
                link: 'http://jwgl.ouc.edu.cn/public/viewSchoolNoticeDetail.action?schoolNoticeId=' + noticeId,
                pubDate: parseDate(tds.eq(3).text(), 'YYYY-MM-DD HH:mm'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('div.notice').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '中国海洋大学选课信息教务通知',
        link,
        description: '中国海洋大学选课信息教务通知',
        item: out,
    });
};
