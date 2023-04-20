const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'http://cs.scnu.edu.cn';
    const url = `${baseUrl}/xueshenggongzuo/chengchangfazhan/kejichuangxin/`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.listshow li a');

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: '华南师范大学计算机学院 学科竞赛',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    pubDate: parseDate(item.find('.r').text()),
                    link: item.attr('href'),
                };
            }),
    };
};
