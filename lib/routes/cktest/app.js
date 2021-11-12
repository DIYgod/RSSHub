const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const ctgroup = ctx.params.ctgroup ? (ctx.params.ctgroup === '0' ? '' : 'CTGRGUP==' + ctx.params.ctgroup) : '';
    const domain = ctx.params.domain ? 'DOMAIN==' + ctx.params.domain : '';

    const rootUrl = `http://www.ckcest.cn/home/app/list?category=${ctgroup}${ctgroup && domain ? ' AND ' : ''}${domain}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const items = $('.search-result-list')
        .map((_, item) => {
            item = $(item);
            const a = item.find('h4.sc-title a');
            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('.applySummary-new').text(),
                author: item.find('.applyInfor-new span').eq(1).text(),
                pubDate: new Date(item.find('.applyInfor-new span').eq(0).text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '知识应用 - 中国工程科技知识中心',
        link: rootUrl,
        item: items,
    };
};
