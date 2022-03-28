const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.bjeea.cn/';
const siteTitle = '北京教育考试院--';

const categoryMap = {
    bjeeagg: { title: '首页 / 通知公告', suffix: 'html/bjeeagg' },
    zkzc: { title: '首页 / 招考政策', suffix: 'html/zkzc' },
    zkkd: { title: '首页 / 自考快递', suffix: 'html/zkkd' },
};

// 专门定义一个function用于加载文章内容
async function load(link) {
    // 异步请求文章
    const response = await got.get(link);
    // 加载文章内容
    const $ = cheerio.load(response.data);
    // 提取文章内容
    const description = $('div.info-txt').html();
    // 返回解析的结果
    return { description };
}

module.exports = async (ctx) => {
    // 默认 正常规定 然后获取列表页面
    const type = ctx.params.type || 'bjeeagg';

    const listPageUrl = baseUrl + categoryMap[type].suffix;
    const response = await got({
        method: 'get',
        url: listPageUrl,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    // 获取当前页面的 list
    const list = $('ul.com-list>li');

    const result = await Promise.all(
        // 遍历每一篇文章
        list
            .map(async (item) => {
                const $ = cheerio.load(list[item]); // 将列表项加载成 html
                const $rel_url = $('a').attr('href'); // 获取 每一项的url

                let $item_url, $is_interior;
                if ($rel_url.substr(0, 4) === 'http') {
                    $item_url = $rel_url;
                    $is_interior = false;
                } else {
                    $item_url = baseUrl.substring(0, baseUrl.length - 1) + $rel_url;
                    $is_interior = true;
                }

                const $title = $('a').text(); // 获取每个的标题

                const date_txt = $('span').text(); // 匹配 yyyy-mm-dd格式时间
                const $pubdate = new Date(date_txt); // 正则匹配发布时间 然后转换成时间

                // 列表上提取到的信息
                // 标题 链接
                const single = {
                    title: $title,
                    pubDate: $pubdate,
                    link: $item_url,
                    guid: $item_url,
                    description: $title,
                };

                // 对于列表的每一项, 单独获取 时间与详细内容
                try {
                    // 文章可能存在404错误，错误则直接使用title当作内容
                    const other = $is_interior ? await ctx.cache.tryGet($item_url, () => load($item_url)) : $title;
                    // 合并解析后的结果集作为该篇文章最终的输出结果
                    return Promise.resolve(Object.assign({}, single, other));
                } catch (e) {
                    return Promise.resolve(single);
                }
            })
            .get()
    );

    ctx.state.data = {
        title: siteTitle + categoryMap[type].title,
        link: baseUrl,
        description: siteTitle + categoryMap[type].title,
        item: result,
    };
};
