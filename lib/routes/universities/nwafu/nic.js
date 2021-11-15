import got from '~/utils/got.js';
import cheerio from 'cheerio';
import { parseDate } from '~/utils/parse-date.js'

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://nic.nwafu.edu.cn/tzgg1/index.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#sort > dd > .list > li');

    ctx.state.data = {
        title: '西北农林科技大学 - 网教中心公告',
        link: 'https://nic.nwafu.edu.cn/tzgg1/index.htm',
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
