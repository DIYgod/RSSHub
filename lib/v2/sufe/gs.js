const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gs.sufe.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/Home/List/${type}`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.archive .active').text() || '研究生院';
    const list = $('.single-blog-item');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.blog-meta').text().trim().slice(6, 16);
            const aTag = item.find('a').first();
            const itemTitle = aTag.text();
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
                    if ($('.single-programme .conn').length > 0) {
                        description = $('.single-programme .conn').html().trim();
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
        title: `上海财经大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `上海财经大学研究生院 - ${typeName}`,
        item: items,
    };
};
