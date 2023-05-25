const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://master.lnnu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName =
        $('.t .name')
            .text()
            .replace(/&nbsp;/g, '') || '研究生院';
    const list = $('.list ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a');
            const itemDate = item.find('.date').text().replace('[', '').replace(']', '');
            const itemTitle = aTag.attr('title') || aTag.text();
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
                    link: item.articleUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `辽宁师范大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `辽宁师范大学研究生院 - ${typeName}`,
        item: items,
    };
};
