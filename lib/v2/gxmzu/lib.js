// 导入got库，该库用来请求网页数据
const got = require('@/utils/got');
// 导入cheerio库，该库用来解析网页数据
const cheerio = require('cheerio');
// 导入parseDate函数，该函数用于日期处理
const { parseDate } = require('@/utils/parse-date');
// 导入timezone库，该库用于时区处理
const timezone = require('@/utils/timezone');

// 广西民大的url链接
const url = 'https://library.gxmzu.edu.cn/news/news_list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1010';
// 广西民大图书馆网址
const host = 'https://library.gxmzu.edu.cn';

module.exports = async (ctx) => {
    // 发起Http请求，获取网页数据
    const response = await got(url);

    // 解析网页数据
    const $ = cheerio.load(response.data);

    // 通知公告的items的标题、url链接、发布日期
    const list = $('#newslist ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            // 使用缓存
            ctx.cache.tryGet(item.link, async () => {
                // 排除非本站点的外链
                if (item.link && !item.link.startsWith('https://library.gxmzu.edu.cn/')) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                    return item;
                }

                // 爬取全文
                const response = await got(item.link);

                // 检查重定向
                if (response.redirectUrls && response.redirectUrls.length > 0) {
                    item.link = response.redirectUrls[0];
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = cheerio.load(response.data);
                    item.title = $('h2').text();
                    item.description = $('.v_news_content').html();
                }
                return item;
            })
        )
    );

    // 生成RSS源
    ctx.state.data = {
        // 项目标题
        title: '广西民族大学图书馆 -- 最新消息',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    };
};
