// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const link = 'https://yz.scnu.edu.cn/tongzhigonggao/ssgg/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.listmod div a');

    ctx.set('data', {
        title: '华南师范大学研究生院',
        link,
        description: '华南师范大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.text(),
                    link: item.attr('href'),
                };
            }),
    });
};
