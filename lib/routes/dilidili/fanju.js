// 调用got获取页面源码
const got = require('@/utils/got');
// 调用cheerio分析抓取到的html,利用类似jQuery的方法解析
const cheerio = require('cheerio');

async function load(link, ctx) {
    // 定义cache 存储通过link获取到的缓存内容
    const cache = await ctx.cache.get(link);
    // 如果缓存已经存在,则直接返回,否则对其进行解析
    if (cache) {
        return cache;
    }
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    // 获取相关内容
    let introduce = $('#intro2 > p:nth-child(3)').text();
    // 将'简介'字段与内容分离,为了更优美的阅读界面
    introduce = introduce.replace('简介', '简介<br>');
    const image = `<img src="${$('.player_img > img').attr('src')}" />`;
    const detailResult = `${introduce}<br>${image}`;

    // 定义description,并指定内容
    const description = detailResult;
    ctx.cache.set(link, description);
    return {
        description,
    };
}

// 通过module.exports暴露给router
module.exports = async (ctx) => {
    const id = ctx.params.id;

    // 使用get方法请求主页面,然后获取其返回的response
    const response = await got({
        method: 'get',
        url: `http://www.dilidili.name/anime/${id}`,
    });
    // 获取页面的html
    const data = response.data;
    // 将页面html交于cheerio处理成类似jQuery的节点
    const $ = cheerio.load(data);
    // 获取番剧名称
    const animeName = $('body > div.container.clear > div.clear > div:nth-child(2) > div.detail.con24.clear > dl > dd > h1').text();

    // @param {*} list 用于存储通过 " h4 > a "获取到的节点
    const beforeFilterList = $('div.swiper-container.xfswiper1 > div > div > ul > li > a').get(); // 获取到剧集列表
    const list = [];
    beforeFilterList.forEach((element) => {
        if ($(element).attr('href').indexOf('http://') !== -1) {
            list.push(element);
        }
    });
    // 使用promise处理多个节点
    const process = await Promise.all(
        // 在list变量上使用map方法,对其拥有的每一个元素均进行"匿名函数"的操作
        list.map(async (item) => {
            // item为回调的参数
            // 定义itemUrl
            const itemUrl = $(item).attr('href');
            // 定义导出到rss的单体对象,包含title,link,guid三个参数
            const single = {
                title: $(item).text(),
                link: itemUrl,
                guid: itemUrl,
            };
            // 调用load方法,获取到的是string对象{description}
            const other = await load(itemUrl, ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `${animeName} - 嘀哩嘀哩`,
        link: `http://www.dilidili.name/anime/${id}`,
        description: `${animeName}更新提醒`,
        item: process,
    };
};
