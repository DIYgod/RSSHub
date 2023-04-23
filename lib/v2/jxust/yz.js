const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.jxust.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/index/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.page_title h3').text() || '研究生招生信息网';
    const list = $('ul li .box');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // 将 YYYY年MM月DD日 转换为 YYYY-MM-DD
            const itemDate = item.find('.time').text().replace(/年|月/g, '-').replace('日', '');
            const itemTitle = item.find('.title a').text();
            const itemPath = item.find('.title a').attr('href');
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
                    if ($('#vsb_content .v_news_content').length > 0) {
                        description = $('#vsb_content .v_news_content').html().trim();
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
        title: `江西理工大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `江西理工大学研究生院 - ${typeName}`,
        item: items,
    };
};
