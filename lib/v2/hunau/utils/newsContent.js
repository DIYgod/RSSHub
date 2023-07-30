const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

async function newsContent(link, department = '') {
    try {
        // 异步请求文章
        const { data: response } = await got(link, {
            https: {
                rejectUnauthorized: false,
            },
        });
        // 加载文章内容
        const $ = cheerio.load(response);
        let reg = /\d{4}\/\d{2}\/\d{2}/;
        let element = '.newscontent';

        // 处理特定部门
        if (department === 'xky') {
            reg = /\d{4}-\d{2}-\d{2}/;
            element = '.content .edit';
        }

        // 解析日期
        const extractDate = ($('.info').first().html()?.match(reg) || [])[0];
        const pubDate = timezone(parseDate(extractDate, 'YYYY-MM-DD', 'zh-cn'), +8);
        // 解析文章
        const newsContent = $(element).first();
        newsContent.find('table').remove();
        let description = newsContent.text().replace(/\s+/g, '');

        // 处理特定部门
        if (department === 'gfxy') {
            description = description.replace('点击下载文件:', '');
        }

        // 返回解析的结果
        return { description, pubDate };
    } catch (error) {
        // Handle the error (e.g., log it and return some default values)
        // console.error(`There was an error fetching the link ${link}: ${error.message}`);
        return { description: '', pubDate: null };
    }
}

module.exports = newsContent;
