const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.nefu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.nav-b a').last().text() || '研究生招生信息网';
    const list = $('.news-list-ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // 将 2020/10 转换为 2020-10
            const itemDateYYYYMM = item.find('.news-left-date span').text().replace(/\//gi, '-');
            const itemDateDD = item.find('.news-left-date').text().slice(0, 2);
            const itemDate = `${itemDateYYYYMM}-${itemDateDD}`;
            const aTag = item.find('.news-right-tt-a a');
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
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#vsb_content .v_news_content').length > 0) {
                        description = $('#vsb_content .v_news_content').html().trim();
                    } else {
                        description = itemTitle;
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
        title: `东北林业大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `东北林业大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
