const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const Config = require('@/config').value;

const host = 'https://yjsc.cdu.edu.cn';

// 反扒严格，需要尝试修改请求头，或者使用puppeteer
// 但是puppeteer尚未支持， cdu相关文件及文档均尚未更新

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got('https://yjsc.cdu.edu.cn/yjszs.htm', {
        headers: {
            host: 'yjsc.cdu.edu.cn',
            Referer: 'https://yjsc.cdu.edu.cn/',
            Cookie: Config.cookies ? Config.cookies : '',
            'sec-ch-ua-platform': 'Windows',
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.side h3').last().text() || '研究生处';
    const list = $('.newList');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.date').text().slice(3, 13);
            const itemTitle = item.find('a').attr('title');
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
        title: `成都大学研究生处 - ${typeName}`,
        link: pageUrl,
        description: `成都大学研究生处 - ${typeName}`,
        item: items,
    };
};
