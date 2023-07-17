const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://ncmte.nimte.ac.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.html`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.links p1').text() || '招生工作';
    const list = $('.content .rCon .nr a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.time').text();
            const aTag = item;
            const itemTitle = aTag.attr('title') || aTag.find('.l p').text();
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
                    if ($('.html').length > 0) {
                        description = $('.html').html().trim();
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
        title: `中国科学院大学宁波材料工程学院招生工作 - ${typeName}`,
        link: pageUrl,
        description: `中国科学院大学宁波材料工程学院招生工作 - ${typeName}`,
        item: items,
    };
};
