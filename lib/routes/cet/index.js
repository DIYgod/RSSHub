const got = require('@/utils/got');
const cheerio = require('cheerio');
async function load(link, ctx) {
    return await ctx.cache.tryGet(link, async () => {
        // 开始加载页面
        const response = await got.get(link);
        const $ = cheerio.load(response.data);
        // 获取标题
        const title = $('#Content1 > div > ul > li > h1').text();
        // 获取正文内容
        const introduce = $('#ReportIDtext').html();

        return {
            title: title,
            description: introduce,
            link: link,
        };
    });
}

module.exports = async (ctx) => {
    const host = `http://cet.neea.edu.cn/html1/category/16093/1124-1.htm`;
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $(`#ReportIDname > a`).get();

    const process = await Promise.all(
        list.map(async (item) => {
            const itemUrl = 'http://cet.neea.edu.cn' + $(item).attr('href');
            const single = {
                title: $(item).text(),
                link: itemUrl,
                guid: itemUrl,
            };
            const other = await load(String(itemUrl), ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `全国大学英语四、六级考试动态`,
        link: host,
        description: `全国大学英语四、六级考试动态`,
        item: process,
    };
};
