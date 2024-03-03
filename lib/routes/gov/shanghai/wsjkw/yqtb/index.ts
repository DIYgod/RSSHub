// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const url = `https://wsjkw.sh.gov.cn/yqtb/index.html`;

    const res = await got.get(url);
    const $ = load(res.data);
    const list = $('.uli16.nowrapli.list-date  li');
    ctx.set('data', {
        title: '疫情通报-上海卫健委',
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.find('a').text();
                    const address = item.find('a').attr('href');
                    const host = `https://wsjkw.sh.gov.cn`;
                    const pubDate = parseDate(item.find('span').text(), 'YYYY-MM-DD');
                    return {
                        title,
                        description: title,
                        pubDate,
                        link: host + address,
                        guid: host + address,
                    };
                })
                .get(),
    });
};
