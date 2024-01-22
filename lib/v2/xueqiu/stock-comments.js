const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const sanitizeHtml = require('sanitize-html');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const res = await got({
        method: 'get',
        url: `https://xueqiu.com/query/v1/symbol/search/status?u=11111&count=100&comment=0&symbol=${id}&source=all&sort=time`,
    });

    // 获取stock_name
    const stock_name = await ctx.cache.tryGet(`stock_name_${id}`, async () => {
        const res = await got({
            method: 'get',
            url: `https://xueqiu.com/S/${id}`,
        });
        const $ = cheerio.load(res.data); // 使用 cheerio 加载返回的 HTML
        return $('.stock-name').text().split('(')[0];
    });

    const data = res.data.list;
    ctx.state.data = {
        title: `${id} ${stock_name} - 评论`,
        link: `https://xueqiu.com/S/${id}`,
        description: `${stock_name} - 评论`,
        item: data.map((item) => {
            let link = `https://xueqiu.com${item.target}`;
            if (item.quote_cards) {
                link = item.quote_cards[0].target_url;
            }
            const description = art(path.join(__dirname, 'templates/comments_description.art'), { item });
            return {
                title: item.title || sanitizeHtml(item.text, { allowedTags: [], allowedAttributes: {} }),
                description,
                pubDate: parseDate(item.created_at),
                link,
            };
        }),
    };
};
