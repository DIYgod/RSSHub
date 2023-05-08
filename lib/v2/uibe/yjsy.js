const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsy.uibe.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/cms/info.do?columnId=${type}`;
    const response = await got(pageUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.columnTitle').first().text() || '硕士生招生';
    const list = $('.articleList li ');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text();
            const aTag = item.find('a').first();
            const itemTitle = aTag.text();
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
                    const result = await got(itemUrl, {
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    const $ = cheerio.load(result.data);
                    if ($('#article .body').length > 0) {
                        description = $('#article .body').html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                const resultData = {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                };
                if (itemDate) {
                    resultData.pubDate = timezone(parseDate(itemDate), 8);
                }
                return resultData;
            });
        })
    );
    ctx.state.data = {
        title: `对外经济贸易大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `对外经济贸易大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
