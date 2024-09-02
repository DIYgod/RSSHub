const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzb.njupt.edu.cn';

module.exports = async (ctx) => {
    const pageUrl = `${host}/main.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = '研究生招生信息网首页';
    const list = $('#content1 .list-menu .list1-item');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('.left1-content-title a');
            const itemDate = item.find('.left1-time .time-ym').text() + '-' + item.find('.left1-time .time-d').text();
            const itemTitle = aTag.text() || aTag.attr('title');
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
                    const content = $('.wp_articlecontent');
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
        title: `南京邮电大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `南京邮电大学研究生院 - ${typeName}`,
        item: items,
    };
};
