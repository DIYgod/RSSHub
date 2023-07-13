const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsy.hunau.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/`;
    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);
    const typeName = $('.list_left_top_news h3').text() || '研究生院';
    const list = $('.article_list_list .article_list ul li');
    const items = await Promise.all(
        Array.from(list).map((item) => {
            item = $(item);
            // const itemDate = item.find('span').text();
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
                    if ($('.newscontent ').length > 0) {
                        description = $('.newscontent ').html().trim();
                    } else {
                        description = itemTitle;
                    }
                    if ($('.info').length > 0) {
                        itemDate = $('.info').text().trim().split('时间:')[1].split('作者:')[0].trim();
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
        title: `湖南农业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `湖南农业大学研究生院 - ${typeName}`,
        item: items,
    };
};
