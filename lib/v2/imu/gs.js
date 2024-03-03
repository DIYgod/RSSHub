const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://gs.imu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.zy_ej on a').text() || '研究生院';
    const list = $('.xw_list .xw_n li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a');
            const itemDate = aTag.find('span').text();
            const itemTitle = aTag.attr('title') || aTag.find('h2').text();
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
                    const content = $('#vsb_content  .v_news_content');
                    if (content.length > 0) {
                        description = content.html().trim();
                        const attachments = $('#vsb_content ul[style="list-style-type:none;"]');
                        if (attachments.length > 0) {
                            description += attachments.html().trim();
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
        title: `内蒙古大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `内蒙古大学研究生院 - ${typeName}`,
        item: items,
    };
};
