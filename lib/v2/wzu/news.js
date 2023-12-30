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

const newsType = {
    wdxw: '温大新闻',
    mtwd: '媒体温大',
    xswd: '学术温大',
    tzgg: '通知公告',
    zbxx: '招标信息',
    xsgg: '学术公告',
};

/**
 * @description: 抓取文章内容
 * @param {*} link
 * @return {*} description
 */
async function load(link) {
    let videoUrl = '';
    // 请求文章页面
    const newsResp = await got.get(link);
    // 加载文章内容
    const $ = cheerio.load(newsResp.data, { decodeEntities: false });
    // 图片相对链接处理
    $('img').attr('src', (n, v) => new URL(v, baseUrl).href);
    // 视频相对链接处理，替换原有播放方法 showVsbVideo
    $('.vsbcontent_video').each(function () {
        const u1 = $(this).find('script').attr('vurl');
        videoUrl = new URL(u1, baseUrl).href;
        return $(this)
            .html('<video width="100%" src="' + videoUrl + '"></video>')
            .html();
    });
    // 返回解析的结果
    return $('div[id^=vsb_content]').html();
}

module.exports = async (ctx) => {
    // 获取路由 Tag
    const routeTag = parseInt(ctx.params.type) || 0;
    // 设定新闻标题及 Url
    const newsArr = Object.entries(newsType);
    const [k1, newsTitle] = newsArr[routeTag];
    const newsLink = new URL(k1 + '.htm', baseUrl).href;

    const response = await got.get(newsLink);
    const $ = cheerio.load(response.data);
    const list = $('#News-sidebar-b-nav').find('li');

    ctx.state.data = {
        title: newsTitle,
        link: newsLink,
        description: '温州大学' + ' - ' + newsTitle,
        item:
            list &&
            list
                .map(async (item) => {
                    const $ = cheerio.load(list[item]);
                    const $a1 = $('li>a');
                    const $originUrl = $a1.attr('href');
                    const $itemUrl = new URL($originUrl, baseUrl).href;
                    return {
                        title: $a1.attr('title'),
                        description: await ctx.cache.tryGet($itemUrl, () => load($itemUrl)),
                        pubDate: parseDate($('li>samp').text(), 'YYYY-MM-DD'),
                        link: $itemUrl,
                    };
                })
                .get(),
    };
};
