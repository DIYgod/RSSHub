const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzb.nju.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.col_title h2').text() || '研究生招生网';
    const list = $('.news_list .news');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemTitle = item.find('a').attr('title');
        const itemDate = item.find('.news_meta').text();
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
                if ($('.read').length > 0) {
                    description = $('.read').html().trim();
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
    });
    ctx.state.data = {
        title: `南京大学 - ${typeName}`,
        link: pageUrl,
        description: `南京大学 - ${typeName}`,
        item: items,
    };
};
