const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://gra.njucm.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.Column_Position a').last().text() || '研究生招生网';
    const list = $('#wp_news_w3 a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
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
                let itemDate = null;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('.wp_articlecontent').length > 0) {
                        description = $('.wp_articlecontent').html().trim();
                    } else {
                        description = itemTitle;
                    }
                    if ($('.Article_PublishDate').length > 0) {
                        itemDate = $('.Article_PublishDate').text();
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
        title: `南京中医药大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `南京中医药大学研究生院 - ${typeName}`,
        item: items,
    };
};
