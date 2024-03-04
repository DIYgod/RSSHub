// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { channels } = require('./channels');

export default async (ctx) => {
    const { channelId = 2834 } = ctx.req.param();
    const baseUrl = 'https://www.chinamoney.com.cn';

    const { data: contents } = await got.post(`${baseUrl}/ags/ms/cm-s-notice-query/contents`, {
        form: {
            pageNo: 1,
            pageSize: 15,
            channelId,
        },
    });

    const list = contents.records.map((item) => ({
        title: item.title,
        link: `${baseUrl}${item.draftPath}`,
        pubDate: timezone(parseDate(item.releaseDate, 'YYYY-MM-DD'), +8),
        contentId: item.contentId,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const article = $('.article-a-body');
                article.find('*').removeAttr('style');
                article.find('font').each((_, ele) => {
                    $(ele).replaceWith($(ele).html());
                });
                article.find('span').each((_, ele) => {
                    $(ele).replaceWith($(ele).html());
                });
                article.find('.article-a-attach-body a').each((i, ele) => {
                    ele = $(ele);
                    if (ele.attr('onclick')?.startsWith("location.href=encodeURI($('#fileDownUrl').val()+'fileDownLoad.do")) {
                        ele.attr('href', `${baseUrl}/dqs/cm-s-notice-query/fileDownLoad.do?mode=open&contentId=${item.contentId}&priority=${i}`);
                        ele.removeAttr('onclick');
                    }
                });

                item.description = article.html();
                item.pubDate = timezone(parseDate($('.AC-l span').text().trim(), 'YYYY-MM-DD HH:mm'), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${channels[channelId] ? channels[channelId].title + ' - ' : ''}中国货币网`,
        link: `${baseUrl}${channels[channelId]?.urlPath ?? ''}`,
        item: items,
    });
};
