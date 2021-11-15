import got from '~/utils/got.js';
import cheerio from 'cheerio';
import {parseDate} from '~/utils/parse-date';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'https://gs.nwsuaf.edu.cn/tzggB/index.htm',
    });

    const $ = cheerio.load(data);
    const list = $('#sort > dd > .list > li');

    ctx.state.data = {
        title: '西北农林科技大学 - 后勤公告',
        link: 'https://gs.nwsuaf.edu.cn/tzggB/index.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('li a').text(), description: item.find('li a').text(), pubDate: parseDate(item.find('span').text(), 'YYYY/MM/DD'), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
