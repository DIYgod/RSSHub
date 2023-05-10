const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.gyig.cas.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/yjsjy_/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.content-title .title-txt').text() || '研究生院';
    const list = $('.list-text li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.box-date').text();
            const aTag = item.find('a');
            const itemTitle = aTag.text();
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
                    if ($('#main-cont').length > 0) {
                        description = $('#main-cont').html().trim();
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
        title: `中国科学院地球化学研究所 - ${typeName}`,
        link: pageUrl,
        description: `中国科学院地球化学研究所 - ${typeName}`,
        item: items,
    };
};
