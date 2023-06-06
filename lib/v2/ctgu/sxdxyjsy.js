const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://sxdxyjsy.ctgu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.location .fl').text() || '研究生院';
    const list = $('.line_lb ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const aTag = item.find('a');
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
                let itemDate = null;
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('#vsb_content').length > 0) {
                        description = $('#vsb_content').html().trim();
                    } else {
                        description = itemTitle;
                    }
                    if ($('.main_bk div[align="center"]').length > 0) {
                        itemDate = $('.main_bk div[align="center"]').text().trim().slice(0, 10).replace('年', '-').replace('月', '-').replace('日', '');
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
        title: `三峡大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `三峡大学研究生院 - ${typeName}`,
        item: items,
    };
};
