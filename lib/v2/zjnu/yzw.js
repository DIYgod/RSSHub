const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yzw.zjnu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const typeName = $('.column-title').text() || '研究生招生信息网';
    const list = $('.wp_article_list_table tr table tr a ');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.parent().next().text();
            const itemTitle = item.attr('title') || item.text();
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
                    const result = await got(itemUrl, { https: { rejectUnauthorized: false } });
                    const $ = cheerio.load(result.data);
                    if ($('.read').length > 0) {
                        description = $('.read').html().trim();
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
        title: `浙江师范大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `浙江师范大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
