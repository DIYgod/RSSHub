const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsc.cuit.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${type}`;
    const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const typeName = $('.con_title h3').first().text() || '研究生院';
    const list = $('.article_lanmu div a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const aTag = $(item);
            const itemDateStr = aTag.find('div[style="font-size: 16px;"]').text();
            const itemTitle = aTag.text().replace('>>', '').replace(itemDateStr, '').trim();
            const itemDate = itemDateStr.replace('[', '').replace(']', '').trim();
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
                    const result = await got(itemUrl, { https: { rejectUnauthorized: false } });
                    const $ = cheerio.load(result.data);
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
                        if ($('ul[style="list-style-type:none;"]').length > 0) {
                            description += $('ul[style="list-style-type:none;"]').html().trim();
                        }
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
        title: `成都信息工程大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `成都信息工程大学研究生院 - ${typeName}`,
        item: items,
    };
};
