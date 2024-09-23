const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.hrbcm.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/zsgz/${type}.htm`;
    const response = await got(pageUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.lmmc').text() || '研究生院';
    const list = $('.main_list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateD1 = item.find('.d1').text();
            const itemDateD2 = item.find('.d2').text();
            const itemDate = `${itemDateD2}-${itemDateD1}`;
            const aTag = item.find('a');
            const itemTitle = aTag.attr('title') || item.find('.title').text();
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
                    const result = await got(itemUrl, {
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
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
        title: `哈尔滨音乐学院研究生院 - ${typeName}`,
        link: pageUrl,
        description: `哈尔滨音乐学院研究生院 - ${typeName}`,
        item: items,
    };
};
