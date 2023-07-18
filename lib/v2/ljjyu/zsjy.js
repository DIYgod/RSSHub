const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://202.202.232.210';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.aspx`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.add h2').text() || '招生就业';
    const list = $('.tbs1 .td2');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a');
            const itemDate = aTag.parent().next().text().trim();
            const itemTitle = aTag.attr('title') || aTag.text();
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
                    if ($('#ctl00_ContentPlaceHolder1_contentLBL').length > 0) {
                        description = $('#ctl00_ContentPlaceHolder1_contentLBL').html().trim();
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
        title: `陆军军医大学招生就业 - ${typeName}`,
        link: pageUrl,
        description: `陆军军医大学招生就业 - ${typeName}`,
        item: items,
    };
};
