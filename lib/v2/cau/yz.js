const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yz.cau.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/col/col${type}/index.html`;
    const response = await got(pageUrl, {
        headers: {
            Host: 'yz.cau.edu.cn',
        },
    });
    const $ = cheerio.load(response.data, { xmlMode: true });
    const typeName = $('.byej_left .cur').text() || '研究生招生网';
    const list = $('recordset record');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const text = $(item).text();
            item = $(text);
            const itemDate = item.find('span').text().slice(1, 11);
            const aTag = item.find('a');
            const itemTitle = aTag.text().split('•')[1].trim();
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
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#zoom').length > 0) {
                        description = $('#zoom').html().trim();
                    } else if ($('.zhengwen').length > 0) {
                        description = $('.zhengwen').html().trim();
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
        title: `中国农业大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `中国农业大学研究生处 - ${typeName}`,
        item: items,
    };
};
