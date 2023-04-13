const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://210.42.121.116';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/wdyz/index.php/index-show-tid-${type}.html`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.CneiyeLeftTit').text() || '研究生招生网';
    const list = $('.list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.date').text();
            const itemTitle = item.find('a').text().trim().replace('>', '');
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
                    if ($('.neiyeRightCon').length > 0) {
                        description = $('.neiyeRightCon').html().trim();
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
        title: `武汉大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `武汉大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
