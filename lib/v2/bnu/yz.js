const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.bnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/list/${type}`;
    const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const typeName = $('.boxtitle .title').text() || '招生网';
    const list = $('.boxlist li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.text-muted').text();
            const itemTitle = item.find('a').last().text();
            const itemPath = item.find('a').last().attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                try {
                    const result = await got(itemUrl, { https: { rejectUnauthorized: false } });
                    const $ = cheerio.load(result.data);
                    if ($('.article-content').length > 0) {
                        description = $('.article-content').html().trim();
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
        title: `北京师范大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `北京师范大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
