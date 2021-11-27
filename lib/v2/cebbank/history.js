const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const utils = require('./utils');

const { TYPE } = utils;

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const url = `https://www.cebbank.com/eportal/ui?struts.portlet.action=/portlet/whpjFront!toView.action&moduleId=12094&pageId=477260&currcode=${TYPE[type].id}&currentPagebak=1&currentPage=1`;
    const res = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(res.data);

    const items = $('.lczj_box tbody tr')
        .map((i, e) => {
            if (i < 2) {
                return null;
            }
            const c = cheerio.load(e, { decodeEntities: false });
            return {
                title: c('td:nth-child(1)').text(),
                description: art(path.join(__dirname, 'templates/historyDes.art'), {
                    fcer: c('td:nth-child(2)').text(),
                    pmc: c('td:nth-child(3)').text(),
                    exrt: c('td:nth-child(4)').text(),
                    mc: c('td:nth-child(5)').text(),
                    time: c('td:nth-child(6)').text(),
                }),
            };
        })
        .get();
    items.pop();
    ctx.state.data = {
        title: '中国光大银行',
        description: `中国光大银行 外汇牌价 ${TYPE[type].name}`,
        item: items,
    };

    ctx.state.json = {
        title: '中国光大银行',
        description: `中国光大银行 外汇牌价 ${TYPE[type].name}`,
        item: items,
    };
};
