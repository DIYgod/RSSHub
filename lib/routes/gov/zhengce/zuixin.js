const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.gov.cn/zhengce/zuixin.htm`;
    const listData = await axios.get(link);
    const $list = cheerio.load(listData.data);
    ctx.state.data = {
        title: `最新政策 - 中国政府网`,
        link,
        item: await Promise.all(
            $list('.news_box .list li:not(.line)')
                .map(async (_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('h4 a');
                    const href = $a.attr('href');
                    const contentData = await axios.get(href.startsWith('/zhengce') ? `http://www.gov.cn${href}` : href);
                    const $content = cheerio.load(contentData.data);
                    return {
                        title: $a.text(),
                        description: $content('#UCAP-CONTENT').html(),
                        link: $a.attr('href'),
                        pubDate: new Date($el.find('.date').text()).toUTCString(),
                    };
                })
                .get()
        ),
    };
};
