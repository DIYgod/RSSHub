const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://gs.gzu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.position a').last().text() || '研究生院';
    const list = $('.wp_article_list_table li .list_cont_title a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
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
                let itemDate = null;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#tablePrint').length > 0) {
                        description = $('#tablePrint').html().trim();
                    } else {
                        description = itemTitle;
                    }
                    if ($('.Article_ly div:nth-child(2) span:nth-child(2)')) {
                        itemDate = $('.Article_ly div:nth-child(2) span:nth-child(2)').text();
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
        title: `贵州大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `贵州大学研究生院 - ${typeName}`,
        item: items,
    };
};
