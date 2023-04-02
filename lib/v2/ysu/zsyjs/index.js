const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://zsjyc.ysu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/yjsxwz/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const list = $('.ul-list4  li');
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('span').text();
            const itemPath = item.find('a').attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, host).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    description = $('#vsb_content_2').html().trim();
                } catch (err) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: parseDate(itemDate),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: '燕山大学研究生招生网 - 硕士招生',
        link: pageUrl,
        description: '燕山大学研究生招生网 - 硕士招生',
        item: items,
    };
};
