const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.lcu.edu.cn';
module.exports = async (ctx) => {
    // let { type } = ctx.request.params;
    // type = type.replace(/-/g, '/');
    const pageUrl = `${host}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '研究生招生网';
    const list = $('.index-teaching .container').first().find('dd');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a');
            const itemTitle = aTag.find('.news_title').text();
            const itemDate = aTag.find('.news_time').text().trim();
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
                    const content = $('.container .xy_article');
                    if (content.length > 0) {
                        description = content.html().trim();
                    } else {
                        description = itemTitle;
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                    pubDate: timezone(parseDate(itemDate), 8),
                };
            });
        })
    );
    ctx.state.data = {
        title: `聊城大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `聊城大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
