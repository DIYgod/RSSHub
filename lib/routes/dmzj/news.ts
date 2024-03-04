// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const url = `https://news.dmzj.com/${ctx.req.param('category') || ''}`;
    const $ = load((await got(url)).data);
    ctx.set('data', {
        title: $('title').text(),
        link: url,
        item: $('.briefnews_con_li .li_img_de')
            .map((_, item) => ({
                title: $(item).find('h3 a').text(),
                link: $(item).find('h3 a').attr('href'),
                author: $(item).find('.head_con_p_o span:nth-child(3)').text().split('：')[1],
                pubDate: timezone(parseDate($(item).find('.head_con_p_o span').first().text(), 'YYYY-MM-DD HH:mm'), +8),
                description: $(item).find('p.com_about').text(),
                category: $(item)
                    .find('.u_comfoot a .bqwarp')
                    .map((_, item) => $(item).text())
                    .get(),
            }))
            .get(),
    });
};
