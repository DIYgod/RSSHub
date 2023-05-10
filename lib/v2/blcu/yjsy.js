const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjsy.blcu.edu.cn';
module.exports = async (ctx) => {
    const { type } = ctx.request.params;
    const pageUrl = `${host}/col/col${type}/index.html`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data, { xmlMode: true });
    const typeName = $('.guojjl').text() || '研究生院';
    const listText = $('record').text();
    const list = cheerio.load(listText)('.date');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.text().replace('[', '').replace(']', '');
            const aTag = item.prev().find('a');
            const itemTitle = aTag.attr('title');
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
                    if ($('#wenzh').length > 0) {
                        description = $('#wenzh').html().trim();
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
        title: `北京语言大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `北京语言大学研究生院 - ${typeName}`,
        item: items,
    };
};
