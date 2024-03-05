// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://admission.pku.edu.cn/zsxx/sszs/index.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.zsxx_cont_list li');

    ctx.set('data', {
        title: `${$('.twostage_title_C').text()} - ${$('title').text()}`,
        link,
        description: '北京大学研究生院通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('li a').text(),
                        description: item.find('li a').text(),
                        link: item.find('li a').attr('href'),
                        pubDate: parseDate(item.find('.zsxxCont_list_time').text()),
                    };
                })
                .get(),
    });
};
