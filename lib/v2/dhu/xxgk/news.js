const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://xxgk.dhu.edu.cn/1737/list.htm';

module.exports = async (ctx) => {
    const link = base_url;
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'utf-8'));
    ctx.state.data = {
        link: base_url,
        title: '东华大学信息公开网-最新公开信息',
        item: $('.cols')
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('href')),
                title: $('a', elem).attr('title'),
                pubDate: new Date($('.cols_meta', elem).text()).toUTCString(),
            }))
            .get(),
    };
};
