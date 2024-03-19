const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://www.ccom.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/jgk/jxkygldw/ysjb/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.list_sj .on').text() || '研究生部';
    const list = $('.news ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.time').text();
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || aTag.find('h4').text();
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
                    const content = $('#vsb_content');
                    if (content && content.length > 0) {
                        description = content.html().trim();
                        const attachment = $('.attach');
                        if (attachment.length > 0) {
                            description += attachment.html().trim();
                        }
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
        title: `中央音乐学院研究生部 - ${typeName}`,
        link: pageUrl,
        description: `中央音乐学院研究生部 - ${typeName}`,
        item: items,
    };
};
