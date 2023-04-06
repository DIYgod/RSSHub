const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjs.suda.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.breadcrumb-nav a').last().text() || '研究生院';
    const list = $('.news-list-item');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemTitle = item.find('a').attr('title');
            const itemYYYYMM = item.find('.date b').text();
            const itemDD = item.find('.date span').text();
            const itemDate = itemYYYYMM + '.' + itemDD;
            const itemPath = item.find('a').attr('href');
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
        title: `苏州大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `苏州大学研究生院 - ${typeName}`,
        item: items,
    };
};
