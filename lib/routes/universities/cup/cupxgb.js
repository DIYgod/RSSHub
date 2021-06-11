const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://xgc.cup.edu.cn/Website/Home/NewsList?B0E586E7C4457C9D699C96A30DE71319D5200ABF014042C7ACE1D31D99276A9C.shtml';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.content li').slice(0, 10);

    ctx.state.data = {
        title: '中国石油大学(北京)学生工作部',
        link: link,
        description: '中国石油大学(北京)学生工作部通知公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return { title: item.find('li a').text(), description: item.find('li a').text(), link: item.find('li a').attr('href') };
                })
                .get(),
    };
};
