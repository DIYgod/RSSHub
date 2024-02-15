const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

function parseContent(content) {
    // 处理Content
    const $ = cheerio.load(content);
    $('noscript').remove(); // 删除所有的<noscript>元素
    $('img').each(function () {
        // 更新所有<img>元素的src属性为data-srcset的值
        const srcset = $(this).attr('data-srcset');
        if (srcset) {
            $(this).attr('src', srcset);
        }
    });
    return $.html();
}

async function processCategory(ctx, id) {
    // 获取Category
    return await ctx.cache.tryGet(`nicesss_categories:${id}`, async () => {
        const { data: response } = await got(`https://www.nicesss.com/wp-json/wp/v2/categories/${id}`);
        return response;
    });
}

async function processTag(ctx, id) {
    // 获取Tag
    return await ctx.cache.tryGet(`nicesss_tags:${id}`, async () => {
        const { data: response } = await got(`https://www.nicesss.com/wp-json/wp/v2/tags/${id}`);
        return response;
    });
}

async function processItems(ctx, response) {
    let items = response.map(async (item) => ({
        title: item.title.rendered,
        link: item.link,
        description: parseContent(item.content.rendered),
        author: await processCategory(ctx, item.categories[0]).then((category) => category.name),
        category: item.tags,
        guid: item.guid.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
    }));
    items = await Promise.all(items);
    return items;
}

module.exports = {
    processUrl: async (url, ctx) => {
        const { data: json } = await got(url);
        return await processItems(ctx, json);
    },
    processCategory,
    processTag,
};
