const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://zs.yjs.cqut.edu.cn';

// 反爬严格，需要puppeteer
// 该路由相关文件及文档均尚未更新

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.position a').last().text() || '研究生招生网';
    const list = $('.list-text  ul li a');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDateMMDD = item.find('.tm p').text();
            const itemDateYYYY = item.find('.tm span').text();
            const itemDate = `${itemDateYYYY}-${itemDateMMDD}`;
            const itemTitle = item.find('.text h1').text();
            const itemPath = item.attr('href');
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
        title: `重庆理工大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `重庆理工大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
