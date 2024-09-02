const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzb.cust.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const list = $('.list_b  .more');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemTitle = item.text();
        const itemPath = item.attr('href');
        const itemDate = item.parent().parent().parent().parent().parent().next().text();
        return ctx.cache.tryGet(itemPath, async () => {
            let description = itemTitle;
            try {
                const result = await got(itemPath);
                const $ = cheerio.load(result.data);
                if ($('.item_content').length > 0) {
                    description = $('.item_content').html().trim();
                } else {
                    description = itemTitle;
                }
            } catch (e) {
                description = itemTitle;
            }
            return {
                title: itemTitle,
                link: itemPath,
                pubDate: timezone(parseDate(itemDate), 8),
                description,
            };
        });
    });
    ctx.state.data = {
        title: '长春理工大学研究生招生网',
        link: pageUrl,
        description: '长春理工大学研究生招生网',
        item: items,
    };
};
