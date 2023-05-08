const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yz.snnu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.col-md-12 .underline a').last().text() || '研究生招生信息网';
    const list = $('.col-md-12 .lightgreybox li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item
                .find('span')
                .text()
                .replace(/(\d{4})年(\d{2})月(\d{2})日/, '$1-$2-$3');
            const itemTitle = item.find('a').attr('title');
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
                    if ($('#vsb_content .v_news_content').length > 0) {
                        description = $('#vsb_content .v_news_content').html().trim();
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
        title: `陕西师范大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `陕西师范大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
