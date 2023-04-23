const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjsy.ncu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.title1').text() || '研究生院';
    const list = $('div table tbody tr td div table tbody tr td  a');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.parent().next().text();
            const itemTitle = item.text();
            const itemPath = item.attr('href');
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
                    if ($('#table1 tr ').last().find('.t4_tr').length > 0) {
                        description = $('#table1 tr ').last().find('.t4_tr').html().trim();
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
        title: `南昌大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `南昌大学研究生院 - ${typeName}`,
        item: items,
    };
};
