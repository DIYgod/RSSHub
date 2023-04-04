const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.ustc.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/column/${type}`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.admissions-bg').text() || '研究生招生在线';
    const list = $('#form .line-box');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemTitle = item.find('.txt').text();
            const itemDate = item.find('.date').text();
            const itemPath = item.attr('onclick').replace("window.open('", '').replace("')", '');
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
                    if ($('.txt-new article').length > 0) {
                        description = $('.txt-new article').html().trim();
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
        title: `中国科学技术大学研究生招生在线 - ${typeName}`,
        link: pageUrl,
        description: `中国科学技术大学研究生招生在线 - ${typeName}`,
        item: items,
    };
};
