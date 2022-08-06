const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

const rootURL = 'http://rsj.taiyuan.gov.cn/';

module.exports = async (ctx) => {
    const categoryID = ctx.params.caty;
    const page = ctx.params.page ?? '1';

    const pageParam = parseInt(page) > 1 ? `_${page}` : '';
    const pagePath = `/zfxxgk/${categoryID}/index${pageParam}.shtml`;

    const currentURL = new URL(pagePath, rootURL);
    const response = await got({ method: 'get', url: currentURL });

    if (response.statusCode !== 200) {
        throw new Error(response.statusMessage);
    }

    const $ = cheerio.load(response.data, { decodeEntities: false });
    const title = $('.tit').find('a:eq(2)').text();
    const list = $('.RightSide_con ul li')
        .map((_, item) => {
            const tag = $(item).find('a');
            const tag2 = $(item).find('span.fr');
            return {
                title: tag.text(),
                link: tag.attr('href'),
                pubDate: timezone(tag2.text(), +8),
            };
        })
        .get();

    ctx.state.data = {
        title: '太原市人力资源和社会保障局 - ' + title,
        link: currentURL.href,
        item: list,
    };
};
