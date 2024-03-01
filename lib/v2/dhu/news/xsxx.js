const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://news.dhu.edu.cn/_wp3services/generalQuery?queryObj=articles&siteId=14&columnId=6410&pageIndex=1&rows=20';

module.exports = async (ctx) => {
    const { data } = await got(baseUrl, {
        headers: {
            Referer: 'https://news.dhu.edu.cn/6410/',
        },
    });
    // 从 API 响应中提取相关数据
    const list = data.data.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.wapUrl,
        // 文章发布日期
        pubDate: parseDate(item.publishTime),
        // 文章作者
        author: item.publisher,
    }));

    // item content
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.new_zwCot').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '学术信息',
        link: 'https://news.dhu.edu.cn/6410',
        item: items,
    };
};
