// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const noticeUrl = 'https://www.teach.ustc.edu.cn/category/notice';
const noticeType = { teaching: '教学', info: '信息', exam: '考试', exchange: '交流' };

export default async (ctx) => {
    const type = ctx.req.param('type') ?? '';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',

        /* headers: {
            'user-agent': UA,
        }, */
        url: `${noticeUrl}${type === '' ? '' : '-' + type}`,
    });

    const $ = load(response.data);
    let items = $(type === '' ? 'ul[class="article-list with-tag"] > li' : 'ul[class=article-list] > li')
        .map(function () {
            const child = $(this).children();
            const info = {
                title: type === '' ? $(child[0]).find('a').text() + ' - ' + $(child[1]).find('a').text() : $(child[0]).find('a').text(),
                link: type === '' ? $(child[1]).find('a').attr('href') : $(child[0]).find('a').attr('href'),
                pubDate: timezone(parseDate($(this).find('.date').text().trim(), 'YYYY-MM-DD'), +8),
            };
            return info;
        })
        .get();

    items = await Promise.all(
        items
            .filter((item) => item.link)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    // www.teach ?? pms.cmet ?? news
                    item.description = $('main[class=single]').html() ?? $('.card-footer').html() ?? $('.v_news_content').html();
                    item.pubDate = $('li[class=meta-date]').text() ? timezone(parseDate($('li[class=meta-date]').text(), 'YYYY-MM-DD HH:mm'), +8) : item.pubDate;
                    return item;
                })
            )
    );

    const desc = type === '' ? '中国科学技术大学教务处 - 通知新闻' : `中国科学技术大学教务处 - ${noticeType[type]}类通知`;

    ctx.set('data', {
        title: desc,
        description: desc,
        link: `${noticeUrl}${type === '' ? '' : '-' + type}`,
        item: items,
    });
};
