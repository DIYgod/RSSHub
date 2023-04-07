const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjszs.ecnu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/system/${type}_list.asp`;
    const response = await got({
        method: 'get',
        url: pageUrl,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const typeName = $('.col-md-9 .col-md-12 .lightgrey').text() || '研究生招生信息网';
    const list = $('.lightgreybox>ul li a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.text().slice(-8);
            const itemTitle = item.text().slice(0, -8);
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
                    const result = await got({
                        method: 'get',
                        url: itemUrl,
                        responseType: 'buffer',
                    });
                    const data = iconv.decode(result.data, 'gb2312');
                    const $ = cheerio.load(data);
                    if ($('.col-md-12').length > 0) {
                        description = $('.col-md-12').html().trim();
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
