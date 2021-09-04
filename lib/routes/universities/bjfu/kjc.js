const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const url = 'http://kyc.bjfu.edu.cn/tztg/index.html';
    const response = await got.get(url, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const list = $('.ll_con_r_b li')
        .slice(0, 10)
        .map((i, e) => {
            const element = $(e);
            const title = element.find('.ll_con_r_b_title a').text();
            const link = element.find('a').attr('href');
            const date = new Date(
                element
                    .find('.ll_con_r_b_time')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)
            );
            const timeZone = 8;
            const serverOffset = date.getTimezoneOffset() / 60;
            const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

            return {
                title: title,
                description: '',
                link: 'http://kyc.bjfu.edu.cn/tztg/' + link,
                author: '北京林业大学科技处通知公告',
                pubDate: pubDate,
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link, {
                responseType: 'buffer',
            });
            const data = iconv.decode(itemReponse.data, 'gb2312');
            const itemElement = cheerio.load(data);

            item.description = itemElement('#a_con_l_con').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '北林科技处通知',
        link: url,
        item: result,
    };
};
