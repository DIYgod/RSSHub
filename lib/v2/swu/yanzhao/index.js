const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yanzhao.swu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/s/yanzhao/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.currentPath a').last().text() || '研究生招生网';
    const list = $('#cnt_lst li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // 去除日期中的【】
            const itemDate = item.find('.rt').text().replace('【', '').replace('】', '');
            const itemTitle = item.find('a').text();
            const itemPath = item.find('a').attr('href');
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
                    if ($('.ct-b-b').length > 0) {
                        description = $('.ct-b-b').html().trim();
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
        title: `西南大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `西南大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
