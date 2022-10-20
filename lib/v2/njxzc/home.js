// 导入got库，该库用来请求网页数据
const got = require('@/utils/got');
// 导入cheerio库，该库用来解析网页数据
const cheerio = require('cheerio');
// 导入parseDate函数，该函数用于日期处理
const { parseDate } = require('@/utils/parse-date');
// 导入timezone库，该库用于时区处理
const timezone = require('@/utils/timezone');

// 通知通告的url链接
const url = 'https://www.njxzc.edu.cn/89/list.htm';
// 南京晓庄学院的首页网址
const host = 'https://www.njxzc.edu.cn';

module.exports = async (ctx) => {
    // 发起Http请求，获取网页数据
    const response = await got({
        method: 'get',
        url,
    });

    // 解析网页数据
    const $ = cheerio.load(response.body);

    // 通知公告的items的url链接
    const urlList = $('body')
        .find('span.news_title a')
        .map((i, e) => $(e).attr('href'))
        .get();

    // 通知公告的items的标题
    const titleList = $('body')
        .find('span.text a')
        .map((i, e) => $(e).text())
        .get();

    // 通知公告的items的发布时间
    const dateList = $('body')
        .find('span.news_meta')
        .map((i, e) => $(e).text())
        .get();

    // 通过Promise.all()方法，获取通知公告中所有item的详细信息
    const out = await Promise.all(
        // 创建一个新数组，
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            // 如果item的链接中包含.htm，则执行以下代码
            if (itemUrl.indexOf('.htm') !== -1) {
                // 使用缓存
                return ctx.cache.tryGet(itemUrl, async () => {
                    const response = await got.get(itemUrl);
                    // 如果返回值中包含重定向的url，则说明该通知无法直接预览
                    if (response.redirectUrls.length !== 0) {
                        const single = {
                            title: titleList[index],
                            link: itemUrl,
                            description: '该通知无法直接预览, 请点击原文链接↑查看',
                            pubDate: timezone(parseDate(dateList[index]), +8),
                        };
                        return single;
                    }
                    const $ = cheerio.load(response.data);
                    const single = {
                        // 通知的标题
                        title: $('.arti_title').text(),
                        // 通知的正文链接
                        link: itemUrl,
                        // 对通知内容的处理，将description中链接的相对地址替换为绝对地址
                        // 并删除字符串两端的空白字符
                        description: $('.wp_articlecontent')
                            .html()
                            .replace(/src="\//g, `src="${new URL('.', host).href}`)
                            .replace(/href="\//g, `href="${new URL('.', host).href}`)
                            .trim(),
                        // 删除“发布时间：”字符串
                        pubDate: timezone(parseDate($('.arti_update').text().replace('发布时间：', '')), +8),
                    };
                    return single;
                });
            } else {
                // 如果item的链接中不包含.htm，则执行以下代码
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知为文件，请点击原文链接↑下载',
                    pubDate: timezone(parseDate(dateList[index]), +8),
                };
                return single;
            }
        })
    );

    // 生成RSS源
    ctx.state.data = {
        // 项目标题
        title: '南京晓庄学院 -- 通知公告',
        // items的内容
        item: out,
    };
};
