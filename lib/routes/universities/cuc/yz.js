const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

const host = 'http://yz.cuc.edu.cn/';

/* 研究生招生网通知公告*/

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: host,
        responseType: 'arraybuffer',
    });

    const responseHtml = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(responseHtml);

    const notice = $('#notice_area').children('.notice_block_top');
    const content = notice.children('.notice_content1').children();

    const items = content
        .map((_, elem) => {
            const a = $('a', elem);
            return {
                link: url.resolve(host, a.attr('href')),
                title: a.text(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: host,
        description: '中国传媒大学研究生招生网 通知公告',
        item: items,
    };
};
