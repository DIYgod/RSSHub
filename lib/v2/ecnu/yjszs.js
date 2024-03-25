const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjszs.ecnu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got({
        method: 'get',
        url: pageUrl,
    });
    // const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(response.data);
    const typeName = $('.col_title h2').text() || '研究生招生信息网';
    const list = $('.col_news_list  ul.news_list li.news');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.news_meta').text();
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
                    const result = await got({
                        method: 'get',
                        url: itemUrl,
                    });
                    const $ = cheerio.load(result.data);
                    const content = $('.read');
                    if (content.length > 0) {
                        description = content.html().trim();
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
        title: `华东师范大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `华东师范大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
