const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const base_url = 'https://xxgk.dhu.edu.cn/1737/list.htm';

module.exports = async (ctx) => {
    const link = base_url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(response.data);
    ctx.state.data = {
        link: base_url,
        title: '东华大学信息公开网-最新公开信息',
        item: $('.cols')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), base_url),
                title: $('a', elem).attr('title'),
                pubDate: timezone(parseDate($('.cols_meta', elem).text()), +8),
            }))
            .get(),
    };
};
