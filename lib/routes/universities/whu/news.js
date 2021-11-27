const got = require('@/utils/got');
const cheerio = require('cheerio');
// const url = require('url');

// 参考 bit/jwc 北京理工大学的的页面写成

const baseUrl = 'https://news.whu.edu.cn/';
const sizeTitle = '--武汉大学新闻网';

const catrgoryMap = {
    wdyw: '武大要闻',
    mtwd: '媒体武大',
    ztbd: '专题报道',
    ljrw: '珞珈人物',
    gjjl: '国际交流',
    bfxy: '缤纷校园',
    xyzs: '校友之声',
    ljlt: '珞珈论坛',
    xwrx: '新闻热线',
    ttxw: '头条新闻',
    zhxw: '综合新闻',
    ljyx: '珞珈影像',
    kydt: '学术动态',
    ljfk: '珞珈副刊',
    xsgc: '校史钩沉',
    lgxd: '来稿选登',
};

// 专门定义一个function用于加载文章内容
async function load(link) {
    let description = '';
    let pubDate = '';

    let response;
    // 如果不是 武汉大学的站点, 直接返回简单的标题即可
    // 判断 是否外站链接,如果是 则直接返回页面 不做单独的解析
    const https_reg = new RegExp('https://news.whu.edu.cn(.*)');
    if (!https_reg.test(link)) {
        return { description };
    }

    // 外部链接访问不到不处理, 校内页面访问不到 记录错误
    try {
        // 异步请求文章
        response = await got.get(link);
    } catch (err) {
        // 如果网络问题 直接出错
        if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
            description = 'Page 404 Please Check!';
        }
        return { description };
    }
    // 加载文章内容
    const $ = cheerio.load(response.data);

    // 正则匹配发布时间 然后转换成时间
    const date_txt = $('div.news_attrib')
        .text()
        .match(/[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d/); // 匹配 yyyy-mm-dd hh:MM 格式时间

    // console.log(link,":",date_txt);
    pubDate = new Date(date_txt[0]);

    // 提取文章内容
    description = $('div.v_news_content').html();
    // 返回解析的结果
    return { description, pubDate };
}

module.exports = async (ctx) => {
    // 默认 武大要闻 然后获取列表页面
    const type = ctx.params.type || 'wdyw';
    const listPageUrl = baseUrl + type + '.htm';
    const response = await got({
        method: 'get',
        url: listPageUrl,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    // 获取当前页面的 list
    const list = $('div.list>div>ul>li');
    list.splice(0, 1); // 删除第一个元素 标题栏

    const result = await Promise.all(
        // 遍历每一篇文章
        list
            .map(async (item) => {
                const $ = cheerio.load(list[item]); // 将列表项加载成 html
                const $rel_url = $('div.infotitle>a').attr('href'); // 获取 每一项的url
                // 判断是否相对链接 然后改写绝对路径 http 默认 否则加上基础路径
                const https_reg = new RegExp('^(?:[a-z]+:)?//');
                const $item_url = https_reg.test($rel_url) ? $rel_url : baseUrl + $rel_url;
                const $title = $('div>a').attr('title'); // 获取每个的标题

                const $pubdate = new Date(
                    $('div.infodate').text().trim()
                    // .match('/[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s/')[0]
                );

                // console.log(item, ":", $item_url,":",$pubdate);

                // 列表上提取到的信息
                // 标题 链接
                const single = {
                    title: $title,
                    pubDate: $pubdate,
                    link: $item_url,
                    guid: $item_url,
                };

                // 对于列表的每一项, 单独获取 时间与详细内容
                const other = await ctx.cache.tryGet($item_url, () => load($item_url));
                // 合并解析后的结果集作为该篇文章最终的输出结果
                return Promise.resolve(Object.assign({}, single, other));
            })
            .get()
    );

    ctx.state.data = {
        title: catrgoryMap[type] + sizeTitle,
        link: baseUrl,
        description: catrgoryMap[type] + sizeTitle,
        item: result,
    };
};
