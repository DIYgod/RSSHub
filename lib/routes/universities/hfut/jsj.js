const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://ci.hfut.edu.cn/xyxw/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('li[class=cle]');

    ctx.state.data = {
        title: '合肥工业大学-计算机学院',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('div').first().text().replace('▣', ''),
                        pubDate: new Date(item.find('div').last().text()).toUTCString(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
