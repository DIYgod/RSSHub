const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsy.hebtu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/a/${type}/index.html`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.current_location a').last().text() || '研究生招生信息网';
    const list = $('.articles ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.date').text();
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
                    if ($('#Content').length > 0) {
                        description = $('#Content').html().trim();
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
        title: `河北师范大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `河北师范大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
