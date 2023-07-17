const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://www.xbmu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/yz/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.erji_list').text() || '研究生招生信息网';
    const list = $('.b-list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.m-date').text();
            const aTag = item.find('a');
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
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
                    } else {
                        description = itemTitle;
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
        title: `西北民族大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `西北民族大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
