const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjsc.imnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.mframe .tm .tt').text() || '研究生院';
    const list = $('.mm .summary');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = '20' + item.find('.foot span').first().text();
            const aTag = item.find('.title a');
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
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#content').length > 0) {
                        description = $('#content').html().trim();
                        if ($('ul[style="list-style-type:none;"]').length > 0) {
                            description += $('ul[style="list-style-type:none;"]').html().trim();
                        }
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
        title: `内蒙古师范大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `内蒙古师范大学研究生院 - ${typeName}`,
        item: items,
    };
};
