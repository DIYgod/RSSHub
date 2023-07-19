const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsxy.sut.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.windowstyle135747').text() || '研究生院';
    const list = $('.winstyle135755 tr[height="20"]');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.timestyle135755').text().trim();
            const aTag = item.find('a.c135755');
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
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
                        if ($('ul[style="list-style-type:none;"]').length > 0) {
                            description += $('ul[style="list-style-type:none;"]').html().trim();
                        }
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
        title: `沈阳工业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `沈阳工业大学研究生院 - ${typeName}`,
        item: items,
    };
};
