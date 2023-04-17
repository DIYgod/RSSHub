const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.jxnu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.Column_Position').last().text() || '研究生招生网';
    const list = $('#wp_news_w2 a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);

            const itemTitle = item.attr('title');
            const itemPath = item.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                let itemDate = null;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('.Article_Content').length > 0) {
                        description = $('.Article_Content').html().trim();
                    }
                    if ($('.Article_PublishDate').length > 0) {
                        itemDate = $('.Article_PublishDate').text();
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
        title: `江西师范大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `江西师范大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
