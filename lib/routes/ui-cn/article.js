const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios('https://www.ui.cn/');
    const $ = cheerio.load(response.data);
    const postList = $('#article')
        .find('.h-article-list')
        .find('li')
        .get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item)
                .find('.ellipsis')
                .text();
            const link =
                'https://www.ui.cn' +
                $(item)
                    .find('.ellipsis')
                    .attr('href');
            const guid = link;
            const temp = await axios(link);
            const description = $(temp.data)
                .find('.works-cont')
                .html();
            const pubDate = new Date(
                $(temp.data)
                    .find('.works-top')
                    .find('.time')
                    .find('em')
                    .text()
                    .replace(/更新于：/g, '')
            ).toUTCString();
            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: description,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '推荐文章 - UI 中国', link: 'https://www.ui.cn/', item: result };
};
