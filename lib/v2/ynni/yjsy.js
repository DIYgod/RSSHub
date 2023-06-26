const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    zs: {
        name: '招生',
        id: '01d7abe2-c0d2-4bd3-b891-d3ae541f84c0',
    },
};

const host = 'http://202.203.158.67';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const typeId = typeMap[type].id;
    const pageUrl = `${host}/web/469079/moreDongtai?categoryId=${typeId}`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = typeMap[type].name;
    const list = $('.clist_alist_ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text().replace(/\//g, '-');
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
                try {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('.center_content').length > 0) {
                        description = $('.center_content').html().trim();
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
        title: `云南民族大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `云南民族大学研究生院 - ${typeName}`,
        item: items,
    };
};
