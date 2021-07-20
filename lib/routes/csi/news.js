const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
module.exports = async (ctx) => {

    const url = 'http://news.csi.com.cn/WJ010.html';
    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.rpt_newlist');

    ctx.state.data = {
        title: '航运信息网-综合资讯',
        link:url,
        description: '航运信息网-综合资讯',
        item: list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.rpt_title a').first().text(),
                        description: '',
                        link: item.find('.rpt_title a').attr('href'),
                        pubDate: parseDate(item.find('.rpt_date').first().text(),'YYYY-MM-DD')
                    };
                })
                .get(),
    };
}
