const got = require('@/utils/got');
const cheerio = require('cheerio');
const { URL } = require('url');
const { parseDate } = require('@/utils/parse-date');

/* 新闻列表
温大新闻 http://www.wzu.edu.cn/index/wdxw.htm
媒体温大 http://www.wzu.edu.cn/index/mtwd.htm
学术温大 http://www.wzu.edu.cn/index/xswd.htm
通知公告 http://www.wzu.edu.cn/index/tzgg.htm
招标信息 http://www.wzu.edu.cn/index/zbxx.htm
学术公告 http://www.wzu.edu.cn/index/xsgg.htm
*/

const baseUrl = 'http://www.wzu.edu.cn/index/';
const newsList = ['温大新闻', '媒体温大', '学术温大', '通知公告', '招标信息', '学术公告'];
const urlList = ['wdxw.htm', 'mtwd.htm', 'xswd.htm', 'tzgg.htm', 'zbxx.htm', 'xsgg.htm'];

/**
 * @description: 抓取文章内容，本函数参考并修改自 whu/news.js，感谢原作者。
 * @param {*} link
 * @return {*}
 */
async function load(link) {
    let description = '';
    let response;
    try {
        // 异步请求文章
        response = await got.get(link);
    } catch (err) {
        // 如果网络问题，直接出错
        if (err.name && (err.name === 'HTTPError' || err.name === 'RequestError')) {
            description = 'Page 404 Please Check!';
        }
        return description;
    }
    // 加载文章内容
    const $ = cheerio.load(response.data);
    // 返回解析的结果
    response = $("form[name='_newscontent_fromname']").children().eq(1).html();
    return response;
}

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = new URL(urlList[type], baseUrl).href;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#News-sidebar-b-nav').find('li');

    ctx.state.data = {
        title: newsList[type],
        link: link,
        description: '温州大学' + ' - ' + newsList[type],
        item:
            list &&
            list
                .map(async (item) => {
                    const $ = cheerio.load(list[item]);
                    const $a1 = $('li>a');
                    const $originUrl = $a1.attr('href');
                    // 判断是否相对链接
                    const httpReg = new RegExp('^(?:[a-z]+:)?//');
                    const $itemUrl = httpReg.test($originUrl) ? $originUrl : new URL($originUrl, baseUrl).href;
                    // no-return-await
                    const funDesc = async () => {
                        const desc = await load($itemUrl);
                        return desc;
                    };
                    return {
                        title: $a1.attr('title'),
                        description: await ctx.cache.tryGet($itemUrl, funDesc),
                        pubDate: parseDate($('li>samp').text(), 'YYYY-MM-DD'),
                        link: $itemUrl,
                    };
                })
                .get(),
    };
};
