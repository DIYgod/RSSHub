const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://grs.lnu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.winstyle13578 a span').last().text() || '研究生院';
    const list = $('.winstyle13579 tbody tr[height="20"]');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.timestyle13579').text().replace(/\//g, '-').replace('&nbsp;', '');
            const itemTitle = item.find('td[width="100%"] a').text();
            const itemPath = item.find('td[width="100%"] a').last().attr('href');
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
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
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
        title: `辽宁大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `辽宁大学研究生院 - ${typeName}`,
        item: items,
    };
};
