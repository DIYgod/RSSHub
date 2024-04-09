const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootURL = 'http://www.zzb.sz.gov.cn/';

module.exports = async (ctx) => {
    const categoryID = ctx.params.caty;
    const page = ctx.params.page ?? '1';

    const pageParam = parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/${categoryID}/index${pageParam}.html`;

    const currentURL = new URL(pagePath, rootURL); // do not use deprecated 'url.resolve'
    const response = await got({ method: 'get', url: currentURL });
    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = cheerio.load(response.data);
    const title = $('#Title').text().trim();
    const list = $('#List tbody tr td table tbody tr td[width="96%"]')
        .map((_, item) => {
            const tag = $(item).find('font a');
            const tag2 = $(item).find('font[size="2px"]');
            return {
                title: tag.text(),
                link: tag.attr('href'),
                pubDate: timezone(parseDate(tag2.text().trim(), 'YYYY/MM/DD'), 0),
            };
        })
        .get();

    ctx.state.data = {
        title: '深圳组工在线 - ' + title,
        link: currentURL.href,
        item: list,
    };
};
