const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootURL = 'http://hrss.sz.gov.cn/';

module.exports = async (ctx) => {
    const categoryID = ctx.params.caty;
    const page = ctx.params.page ?? '1';

    const pageParam = parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/szksy/zwgk/${categoryID}/index${pageParam}.html`;

    const currentURL = new URL(pagePath, rootURL); // do not use deprecated 'url.resolve'
    const response = await got({ method: 'get', url: currentURL });
    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = cheerio.load(response.data);
    const title = $('.zx_rm_tit span').text().trim();
    const list = $('.zx_ml_list ul li')
        .slice(1)
        .map((_, item) => {
            const tag = $(item).find('div.list_name a');
            const tag2 = $(item).find('span:eq(1)');
            return {
                title: tag.text().trim(),
                link: tag.attr('href'),
                pubDate: timezone(parseDate(tag2.text().trim(), 'YYYY/MM/DD'), 0),
            };
        })
        .get();

    ctx.state.data = {
        title: '深圳市考试院 - ' + title,
        link: currentURL.href,
        item: list,
    };
};
