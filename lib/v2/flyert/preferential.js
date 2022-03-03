const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
const host = 'https://www.flyert.com';
const target = `${host}/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322`;

module.exports = async (ctx) => {
    const response = await got.get(target, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(gbk2utf8(response.data));
    const items = $('.comiis_wzli');
    ctx.state.data = {
        title: '飞客茶馆优惠',
        link: 'https://www.flyert.com/',
        description: '飞客茶馆优惠',
        item:
            items &&
            items
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.wzbt').text(),
                        description: item.find('.wznr > div:first-child').text(),
                        link: `${host}/${item.find('.wzbt a').attr('href')}`,
                    };
                })
                .get(),
    };
};
