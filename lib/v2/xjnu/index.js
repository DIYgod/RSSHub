const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

// 反爬严格

const host = 'https://www.xjnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.col_item_link.selected .column-name').text() || '新疆师范大学';
    const list = $('li.news');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateDD = item.find('.left .news_metat').text();
            const itemDateYYYYMM = item.find('.left .news_metab').text();
            const itemDate = `${itemDateYYYYMM}-${itemDateDD}`;
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
                    if ($('.wp_articlecontent').length > 0) {
                        description = $('.wp_articlecontent').html().trim();
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
        title: `新疆师范大学 - ${typeName}`,
        link: pageUrl,
        description: `新疆师范大学 - ${typeName}`,
        item: items,
    };
};
