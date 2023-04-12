const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const typeMap = {
    tzgg: {
        key: 'tzgg/main',
        name: '通知公告',
        listSelector: '.common-right .common-list .list-S',
    },
    sszsjz: {
        key: '32983/list',
        name: '硕士招生简章',
        listSelector: '.common-right .common-list .list-S',
    },
};

const host = 'https://yz.jnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = typeMap[type];
    const pageUrl = `${host}/${type.key}.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = type.name || '研究生招生信息网';
    const list = $(type.listSelector);
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('span').text();
            const itemTitle = item.find('a').text();
            const itemPath = item.find('a').attr('href');
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
                    if ($('wp_articlecontent').length > 0) {
                        description = $('wp_articlecontent').html().trim();
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
        title: `暨南大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `暨南大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
