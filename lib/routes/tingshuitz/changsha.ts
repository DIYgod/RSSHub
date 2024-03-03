// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'http://www.supplywater.com';

export default async (ctx) => {
    const { channelId = 78 } = ctx.req.param();
    const listPage = await got('http://www.supplywater.com/tstz-' + channelId + '.aspx');
    const $ = load(listPage.data);
    const pageName = $('.mainRightBox .news-title').text();
    const list = $('.mainRightBox .announcements-title a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text().trim(),
                link: baseUrl + item.attr('href').trim(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            const postPage = await got(item.link);
            const $ = load(postPage.data);

            const data = {
                title: item.title,
                description: $('.mainRightBox div:last').html().trim(),
                pubDate: parseDate($('.mainRightBox .gxsj span:first').text() + ' +0800', 'YYYY/M/D H:m:s ZZ'),
                link: item.link,
                author: $('.mainRightBox .gxsj span:last').text(),
            };
            return data;
        })
    );

    ctx.set('data', {
        title: `${pageName}通知 - 长沙水业集团`,
        link: `${baseUrl}/fuwuzhinan.aspx`,
        item: items,
    });
};
