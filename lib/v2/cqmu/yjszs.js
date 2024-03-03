const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjszs.cqmu.edu.cn';

module.exports = async (ctx) => {
    const pageUrl = `${host}/index.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '研究生招生网';
    const list = $('.vsb-space .box_ele  ul li a, .vsb-space .seven_list  ul li a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const aTag = $(item);
            const itemTitle = aTag.attr('title') || aTag.text().slice(5);
            const itemPath = aTag.attr('href');
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
                    const content = $('#vsb_content');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    const dateText = $('form[name="_newscontent_fromname"] h3 span').first().text();
                    if (dateText) {
                        itemDate = dateText.slice(-10);
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
        title: `重庆医科大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `重庆医科大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
