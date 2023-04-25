const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yz.cqu.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}.html`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.mainleft_menu_list .on').text() || '研究生招生信息网';
    // 截取数组前20个元素
    const list = $('#hiddenresult .list_cont').slice(0, 20);
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.list_cont_2').text();
            const itemTitle = item.find('.list_cont_1 a').text();
            const itemPath = item.find('.list_cont_1 a').attr('href');
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
                    if ($('yznews').length > 0) {
                        description = $('yznews').html().trim();
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
        title: `重庆大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `重庆大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};
