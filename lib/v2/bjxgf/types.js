/*
 * @Author: Sxuet
 * @Date: 2022-04-13 10:44:28
 * @LastEditTime: 2022-04-15 10:06:52
 * @LastEditors: Sxuet
 * @FilePath: /RSSHub/lib/routes/bjxgf/types.js
 * @Description: 北极星光伏 - 要闻
 */
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const response = await got({
        method: 'get',
        url: `https://guangfu.bjx.com.cn/${type}/`,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const typeName = $('div.box2 em:last').text();
    const list = $('div.cc-list-content ul li');
    ctx.state.data = {
        title: `北极星太阳能光大网${typeName}`,
        link: `https://guangfu.bjx.com.cn/${type}/`,
        item: list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    description: item.html(),
                    link: item.find('a').attr('href')
                };
            })
            .get(),
        };
};
