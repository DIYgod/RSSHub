const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yzb.chd.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.col_title').text() || '研究生招生网';
    const list = $('.wp_article_list .list_item');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.Article_PublishDate').text();
            const itemTitle = item.find('a').attr('title');
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
                    if ($('.wp_articlecontent').length > 0) {
                        description = $('.wp_articlecontent').html().trim();
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
        title: `长安大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `长安大学研究生招生网 - ${typeName}`,
        item: items,
    };
};
