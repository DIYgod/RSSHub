const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const host = 'http://yz.cuc.edu.cn/';

/* 研究生招生网通知公告*/

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: host,
        responseType: 'buffer',
    });

    const responseHtml = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(responseHtml);

    const notice = $('#notice_area').children('.notice_block_top');
    const content = notice.children('.notice_content1').children('p');
    const items = content
        .map((_, elem) => {
            const a = $('a', elem);
            return {
                link: new URL(a.attr('href'), host).href,
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
