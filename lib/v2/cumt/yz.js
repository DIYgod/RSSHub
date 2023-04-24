const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.cumt.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/index/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.nytit a').last().text() || '研究生招生网';
    const list = $('.Newslist ul li');

    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDD = item.find('.time h3').text();
            const itemMM = item.find('.time h5').text();
            const itemYYYY = item.find('.time p').text();
            const itemDate = itemYYYY + '-' + itemMM + '-' + itemDD;
            const aTag = item.find('a');
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
                    if ($('.v_news_content').length > 0) {
                        description = $('.v_news_content').html().trim();
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
        title: `中国矿业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `中国矿业大学研究生院 - ${typeName}`,
        item: items,
    };
};
