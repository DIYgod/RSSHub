const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// 参考 bit/jwc 北京理工大学的的页面写成

const baseUrl = 'https://news.whu.edu.cn/';

// 专门定义一个function用于加载文章内容
async function load(link) {
    let description = '';
    let pubDate = '';

    let response;

    // 外部链接访问不到不处理, 校内页面访问不到 记录错误
    try {
        // 异步请求文章
        response = await got(link);
    } catch (err) {
        // 如果网络问题 直接出错
        if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
            description = 'Page 404 Please Check!';
        }
        return { description };
    }
    // 加载文章内容
    const $ = cheerio.load(response.data);

    pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content')), 8) : undefined;

    $('div.v_news_content')
        .find('img')
        .each((_, e) => {
            e = $(e);
            if (e.attr('orisrc')) {
                e.attr('src', new URL(e.attr('orisrc'), response.url).href);
                e.removeAttr('orisrc');
                e.removeAttr('vurl');
            }
        });

    // 提取文章内容
    description = $('div.v_news_content').html();
    // 返回解析的结果
    return {
        description,
        pubDate,
        author: $('meta[name="ContentSource"]').attr('content'),
    };
}

module.exports = async (ctx) => {
    // 默认 武大要闻 然后获取列表页面
    const type = ctx.params.type || 'wdzx/wdyw';
    const listPageUrl = baseUrl + type + '.htm';
    const response = await got(listPageUrl);
    const $ = cheerio.load(response.data);

    // 获取当前页面的 list
    const list = $('.nyleft ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title') || item.find('.eclips').text(),
                link: new URL(a.attr('href'), listPageUrl).href,
                description: item.find('.line2').text(),
                pubDate: item.find('time').length ? parseDate(item.find('time').text(), 'YYYY.MM.DD') : item.find('.line3').length ? parseDate(item.find('.line3').text()) : undefined,
            };
        });

    const result = await Promise.all(
        // 遍历每一篇文章
        list.map((item) =>
            // 合并解析后的结果集作为该篇文章最终的输出结果
            ctx.cache.tryGet(item.link, async () => {
                // 如果不是 武汉大学的站点, 直接返回简单的标题即可
                // 判断 是否外站链接,如果是 则直接返回页面 不做单独的解析
                if (!item.link.startsWith(baseUrl)) {
                    return item;
                }

                const { description, pubDate, author } = await load(item.link);

                item.description = description;
                item.pubDate = pubDate;
                item.author = author;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').first().text(),
        link: listPageUrl,
        item: result,
    };
};
