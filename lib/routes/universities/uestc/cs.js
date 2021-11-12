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
    const description = $('div#vsb_content').html().replace(reg, '');

    // 提取内容
    return { description };
}

const ProcessFeed = (list, caches) => {
    const host = 'http://www.scse.uestc.edu.cn/';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('span a').text();
            // 还原相对链接为绝对链接
            const itemUrl = $('span a').attr('href').replace('..', host);
            const itemDate = new Date($('span#time').text().replace(/-/g, '/')).toUTCString();

            // 列表上提取到的信息
            const single = {
                title,
                link: itemUrl,
                author: '成电计算机',
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

// 网站地图 http://www.scse.uestc.edu.cn/index/wzdt.htm
// 通知公告
// 办公室 http://www.scse.uestc.edu.cn/tzgg/bgs.htm
// 组织人事 http://www.scse.uestc.edu.cn/tzgg/zzrs.htm
// 科研科 http://www.scse.uestc.edu.cn/tzgg/kyk.htm
// 研管科 http://www.scse.uestc.edu.cn/tzgg/ygk.htm
// 教务科 http://www.scse.uestc.edu.cn/tzgg/jwk.htm
// 学生科 http://www.scse.uestc.edu.cn/tzgg/xsk.htm
// 国际办 http://www.scse.uestc.edu.cn/tzgg/gjb.htm
// 综合教育 http://www.scse.uestc.edu.cn/tzgg/zhjy.htm
// 创新创业 http://www.scse.uestc.edu.cn/tzgg/cxcy.htm
// Info http://www.scse.uestc.edu.cn/tzgg/Info.htm
// 安全工作 http://www.scse.uestc.edu.cn/tzgg/aqgz.htm
// 学术看板 http://www.scse.uestc.edu.cn/ztlj/xskb.htm

// 测试: http://localhost:1200/uestc/cs/ztlj*xskb+tzgg*jwk
module.exports = async (ctx) => {
    const baseUrl = 'http://www.scse.uestc.edu.cn/';
    const type = ctx.params.type || 'ztlj*xskb';
    const allType = type.split('+');

    const listLink = [];
    for (const idx in allType) {
        listLink.push(baseUrl + allType[idx].replace('*', '/') + '.htm');
    }

    const Pages = await ProcessListPage(listLink, ctx.cache);

    let headName = '计算机';
    let list = null;
    // 合并要处理的link
    for (const idx in Pages) {
        const $ = cheerio.load(Pages[idx].data);
        headName = headName + '+' + $('title').text().split('-')[0];
        if (list === null) {
            list = $('div#newsList').find('p');
        } else {
            list = $('div#newsList').find('p').append(list);
        }
    }
    list = list.get();

    const result = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: headName,
        link: baseUrl,
        description: '电子科技大学 - ' + headName,
        item: result,
    };
};
