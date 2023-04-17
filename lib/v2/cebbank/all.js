const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const link = 'https://www.cebbank.com/eportal/ui?pageId=477257';
    const content = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(content.data);

    const items = $('.lczj_box tbody tr')
        .map((i, e) => {
            if (i < 2) {
                return null;
            }
            const c = cheerio.load(e, { decodeEntities: false });
            return {
                title: c('td:nth-child(1)').text(),
                description: art(path.join(__dirname, 'templates/allDes.art'), {
                    fcer: c('td:nth-child(2)').text(),
                    pmc: c('td:nth-child(3)').text(),
                    exrt: c('td:nth-child(4)').text(),
                    mc: c('td:nth-child(5)').text(),
                }),
                pubDate: timezone(parseDate($('#t_id span').text().substring(5), 'YYYY-MM-DD HH:mm', true), 8),
                guid: md5(c('td:nth-child(1)').text() + $('#t_id span').text().substring(5)),
            };
        })
        .get();

    ctx.state.data = {
        title: '中国光大银行',
        description: '中国光大银行 外汇牌价',
        link,
        item: items,
    };

    ctx.state.json = {
        title: '中国光大银行',
        description: '中国光大银行 外汇牌价',
        pubDate: timezone(parseDate($('#t_id span').text().substring(5), 'YYYY-MM-DD HH:mm', true), 0),
        item: items,
    };
};
