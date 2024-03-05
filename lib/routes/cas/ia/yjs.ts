// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const link = 'http://www.ia.cas.cn/yjsjy/zs/sszs/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.col-md-9 li');

    ctx.set('data', {
        title: '中科院自动化所',
        link,
        description: '中科院自动化所通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('li a').text(),
                    description: item.find('li a').text(),
                    link: item.find('li a').attr('href'),
                };
            }),
    });
};
