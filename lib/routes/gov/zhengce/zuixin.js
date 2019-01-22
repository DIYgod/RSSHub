const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.gov.cn/zhengce/zuixin.htm`;
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: `最新政策 - 中国政府网`,
        link,
        item: $('.news_box .list li:not(.line)')
            .map((i, el) => {
                const $el = $(el);
                const $a = $el.find('h4 a');
                return {
                    title: $a.text(),
                    description: $a.text(),
                    link: $a.attr('href'),
                    pubDate: new Date($el.find('.date').text()).toUTCString(),
                };
            })
            .get(),
    };
};
