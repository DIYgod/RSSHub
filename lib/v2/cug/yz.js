const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yz.cug.edu.cn';

// 反爬措施
// 尝试修改请求头 或者 使用puppeteer
// 相关文件及代码均未改

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/page/list/PVKZRL/${type}_10_1`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.Article_details_tltle a').last().text() || '研究生招生信息网';
    const list = $('.subList_content_msg  ul li');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.time').text();
            const itemTitle = item.find('.title').text();
            const infoId = item.find('a').attr('inofid');
            const itemUrl = `${host}/page/detail/PVKZRL/${type}/${infoId}`;
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#container').length > 0) {
                        description = $('#container').html().trim();
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
        title: `中国地质大学（武汉）研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `中国地质大学（武汉）研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
