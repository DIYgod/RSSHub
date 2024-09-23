const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjs.gxmu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.listTitle').text() || '招生工作';
    const list = $('ul.words li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateMMDD = item.find('.l strong').text().trim();
            const itemDateYYYY = item.find('.l span').text().trim();
            const itemDate = `${itemDateYYYY}-${itemDateMMDD}`;
            const aTag = item.find('a');
            const itemPath = aTag.attr('href');
            const itemTitle = item.find('.r h3').text().trim();
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
                    const content = $('.contents .cont');
                    if (content.length > 0) {
                        description = content.html().trim();
                    }
                    const attachments = $('ul[style="list-style-type:none;"]');
                    if (attachments.length > 0) {
                        description += attachments.html().trim();
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
        title: `广西医科大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `广西医科大学研究生院 - ${typeName}`,
        item: items,
    };
};
