const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

// 反爬严格

const host = 'https://yjsb.tiangong.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/list.htm`;
    const response = await got(pageUrl, {
        Headers: {
            Referer: 'https://yjsb.tiangong.edu.cn/',
            Host: `yjsb.tiangong.edu.cn`,
        },
    });
    const $ = cheerio.load(response.data);
    const typeName = $('.col_title h2').text() || '研究生院';
    const list = $('.wp_article_list li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            const itemDate = item.find('.Article_PublishDate').text();
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
                    if ($('.entry .read').length > 0) {
                        description = $('.entry .read').html().trim();
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
        title: `天津工业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `天津工业大学研究生院 - ${typeName}`,
        item: items,
    };
};
