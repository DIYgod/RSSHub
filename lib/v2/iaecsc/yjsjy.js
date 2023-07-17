const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.iae.cas.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/gb2019/yanjiushegnjiaoyu/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.lanmu1_l').text() || '研究生教育';
    const list = $('.list-news ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.right').text();
            const aTag = item.find('a');
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
                    if ($('.TRS_Editor').length > 0) {
                        description = $('.TRS_Editor').html().trim();
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
        title: `中国科学院沈阳应用生态研究所 - ${typeName}`,
        link: pageUrl,
        description: `中国科学院沈阳应用生态研究所 - ${typeName}`,
        item: items,
    };
};
