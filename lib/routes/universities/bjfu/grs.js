const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const url = 'http://graduate.bjfu.edu.cn/pygl/pydt/index.html';
    const response = await got.get(url, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const list = $('.itemList li')
        .slice(0, 10)
        .map((i, e) => {
            const element = $(e);
            const title = element.find('li a').attr('title');
            const link = element.find('li a').attr('href');
            const date = new Date(
                element
                    .find('li a')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)
            );
            const timeZone = 8;
            const serverOffset = date.getTimezoneOffset() / 60;
            const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

            return {
                title,
                description: '',
                link: 'http://graduate.bjfu.edu.cn/pygl/pydt/' + link,
                author: '北京林业大学研究生院培养动态',
                pubDate,
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

            item.description = itemElement('.articleTxt').html();

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '北林研培养动态',
        link: url,
        item: result,
    };
};
