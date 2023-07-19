const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsc.yau.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.sb2_head .title').text() || '研究生院';
    const list = $('.sb2_main ul.label_ul_b li a');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            const aTag = $(item);
            const itemTitle = aTag.attr('title') || aTag.text();
            const itemPath = aTag.attr('href');
            const itemDate = aTag.prev().text().replace(/\[|\]/g, '').replace('年', '-').replace('月', '-').replace('日', '');
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
        title: `延安大学大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `延安大学大学研究生院 - ${typeName}`,
        item: items,
    };
};
