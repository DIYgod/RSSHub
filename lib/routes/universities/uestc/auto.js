const got = require('@/utils/got');
const cheerio = require('cheerio');

// 获取含有列表的页面
async function loadTypePage(link) {
    const Response = await got({
        method: 'get',
        url: link,
    });
    const data = Response.data;
    return { data };
}
// 同步获取含有列表的页面
const ProcessListPage = (list, caches) =>
    Promise.all(
        list.map(async (link) => {
            const itemUrl = link;
            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => loadTypePage(itemUrl));
            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, other));
        })
    );

// 完整文章页
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // 将style去掉
    const reg = /style\s*?=\s*?([‘"])[\s\S]*?\1/gi;
    const description = $('div.v_news_content').html().replace(reg, '');

    // 提取内容
    return { description };
}

// 同步完整文章页
const ProcessFeed = (list, caches) => {
    const host = 'http://www.auto.uestc.edu.cn/';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h6 a').text();

            // 还原相对链接为绝对链接
            const itemUrl = $('h6 a').attr('href').replace('..', host);
            const itemDate = new Date($('span').text().replace(/-/g, '/')).toUTCString();

            // 列表上提取到的信息
            const single = {
                title,
                link: itemUrl,
                author: '成电自动化',
                guid: itemUrl,
                pubDate: itemDate,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

// 通知公告 http://www.auto.uestc.edu.cn/index/tzgg1.htm
// 学术看板 http://www.auto.uestc.edu.cn/index/xskb1.htm
// 焦点新闻 http://www.auto.uestc.edu.cn/index/jdxw.htm
// 综合新闻 http://www.auto.uestc.edu.cn/index/zhxw1.htm

// 测试：http://localhost:1200/uestc/auto/tzgg1+xskb1
module.exports = async (ctx) => {
    const baseUrl = 'http://www.auto.uestc.edu.cn/';
    const baseIndexUrl = 'http://www.auto.uestc.edu.cn/index/';

    const type = ctx.params.type || 'tzgg1';
    const allType = type.split('+');

    const listLink = [];
    for (const idx in allType) {
        listLink.push(baseIndexUrl + allType[idx] + '.htm');
    }
    const Pages = await ProcessListPage(listLink, ctx.cache);

    // 合并要处理的link
    let headName = '自动化';
    let list = null;
    for (const idx in Pages) {
        const $ = cheerio.load(Pages[idx].data);
        headName = headName + '+' + $('title').text().split('-')[0];
        if (list === null) {
            list = $('dl.clearfix');
        } else {
            list = $('dl.clearfix').append(list);
        }
    }
    list = list.get();

    // 处理所有的页面
    const result = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: headName,
        link: baseUrl,
        description: '电子科技大学 - ' + headName,
        item: result,
    };
};
