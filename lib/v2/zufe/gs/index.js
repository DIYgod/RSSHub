const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://gs.zufe.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.position a').last().text() || '研究生院';
    const list = $('.list ul li a');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemTitle = item.attr('title');
        const itemDate = item.find('i').text();
        const itemPath = item.attr('href');
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
                if ($('#vsb_content_2').length > 0) {
                    description = $('#vsb_content_2').html().trim();
                } else if ($('#vsb_content').length > 0) {
                    description = $('#vsb_content').html().trim();
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
    });
    ctx.state.data = {
        title: `浙江财经大学研究生研究生院 - ${typeName}`,
        link: pageUrl,
        description: `浙江财经大学研究生研究生院 - ${typeName}`,
        item: items,
    };
};
