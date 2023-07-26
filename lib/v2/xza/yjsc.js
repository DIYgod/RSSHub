const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.xza.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/gljg/yjsc/main/moref.asp?title=${type}`;
    const response = await got({
        method: 'get',
        url: pageUrl,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const typeName = $('.place a').text().replace('>>', '') || '研究生处';
    const list = $('.allwidth table tbody tr td.td a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const aTag = $(item);
            const itemDate = aTag.parent().next().next().next().text();
            const itemTitle = aTag.attr('title') || aTag.text();
            const itemPath = aTag.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got({
                        method: 'get',
                        url: itemUrl,
                        responseType: 'buffer',
                    });
                    const data = iconv.decode(result.data, 'gb2312');
                    const $ = cheerio.load(data);
                    if ($('.allwidth div center b').length > 0) {
                        description = $('.allwidth div center b').parent().parent().next().html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `西藏农牧学院研究生处 - ${typeName}`,
        link: pageUrl,
        description: `西藏农牧学院研究生处 - ${typeName}`,
        item: items,
    };
};
