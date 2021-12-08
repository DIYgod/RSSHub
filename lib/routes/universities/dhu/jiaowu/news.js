const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://jw.dhu.edu.cn';

const map = {
    student: '/tzggwxszl/list.htm',
    teacher: '/tzggwjszl/list.htm',
};
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = map.hasOwnProperty(type) ? `${base_url}${map[type]}` : `${base_url}/tzggwxszl/list.htm`;
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
        title: '东华大学教务处-' + $('.col_title').text(),
        item: $('.list_item')
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('href')),
                title: $('a', elem).attr('title'),
                pubDate: new Date($('.Article_PublishDate', elem).text()).toUTCString(),
            }))
            .get(),
    };
};
