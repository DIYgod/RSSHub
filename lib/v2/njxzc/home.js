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
    const response = await got(url);

    // 解析网页数据
    const $ = cheerio.load(response.data);

    // 通知公告的items的标题、url链接、发布日期
    const list = $('.news_list .news')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: host + item.find('a').attr('href'),
                pubDate: timezone(parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            // 使用缓存
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.title = $('.arti_title').text();
                item.description = $('.wp_articlecontent')
                    .html()
                    .replace(/src="\//g, `src="${new URL('.', host).href}`)
                    .replace(/href="\//g, `href="${new URL('.', host).href}`)
                    .trim();
                item.pubDate = timezone(parseDate($('.arti_update').text().replace('发布时间：', '')), +8);

                return item;
            })
        )
    );

    // 生成RSS源
    ctx.state.data = {
        // 项目标题
        title: '南京晓庄学院 -- 通知公告',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    };
};
