const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://cs.scnu.edu.cn/xueshenggongzuo/chengchangfazhan/kejichuangxin/',
        headers: {
            Referer: 'https://cs.scnu.edu.cn',
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.listshow').find('li');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://cs.scnu.edu.cn/xueshenggongzuo/chengchangfazhan/kejichuangxin/',
        description: '华南师范大学计算机学院 学科竞赛',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item
                            .find('a')
                            .text()
                            .replace(/\d{4}-\d{2}-\d{2}/, ''),
                        pubDate: new Date(item.find('.r').text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
