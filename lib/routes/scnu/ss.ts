// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'http://ss.scnu.edu.cn/tongzhigonggao/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.listshow li a');

    ctx.set('data', {
        title: '华南师范大学软件学院',
        link,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: item.attr('href'),
                    pubDate: parseDate(item.find('.time').text()),
                };
            }),
    });
};
