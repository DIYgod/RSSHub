// 导入got库，该库用来请求网页数据
const got = require('@/utils/got');
// 导入cheerio库，该库用来解析网页数据
const cheerio = require('cheerio');
// 导入parseDate函数，该函数用于日期处理
const { parseDate } = require('@/utils/parse-date');
// 导入timezone库，该库用于时区处理
const timezone = require('@/utils/timezone');

// 研招网通知公告的url链接
const url = 'https://yz.jou.edu.cn/index/zxgg.htm';
// 江苏海洋大学研招网的网址
const host = 'https://yz.jou.edu.cn';

module.exports = async (ctx) => {
    // 发起Http请求，获取网页数据
    const response = await got({ url, https: { rejectUnauthorized: false } });
    // 解析网页数据
    const $ = cheerio.load(response.data);

    // 通知公告的items的标题、url链接、发布日期
    const list = $('table.winstyle207638 > tbody > tr')
        .filter((index, item) => {
            const currentItem = $(item);
            const item1 = currentItem.find('td:eq(1)');
            const hasLink = item1.find('a').length > 0;
            const isLastItem = index === $('table.winstyle207638 > tbody > tr').length - 1;
            return hasLink && !isLastItem;
        })
        .toArray()
        .map((item) => {
            const currentItem = $(item); // 获取当前tr元素的jQuery对象
            const item1 = currentItem.find('td:eq(1)'); // 获取当前tr元素下的第二个td
            const item2 = currentItem.find('td:eq(2)'); // 获取当前tr元素下的第三个td
            const link = host + item1.find('a').attr('href');

            return {
                title: item1.find('a').attr('title'),
                link: link.replace('..', ''),
                pubDate: timezone(parseDate(item2.find('.timestyle207638').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            // 使用缓存
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({ url: item.link, https: { rejectUnauthorized: false } });
                if (response.redirectUrls.length > 0) {
                    item.link = response.redirectUrls[0];
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = cheerio.load(response.data);
                    item.title = $('.titlestyle207543').text();
                    item.description = $('.v_news_content')
                        .html()
                        .replace(/src="\//g, `src="${new URL('.', host).href}`)
                        .replace(/href="\//g, `href="${new URL('.', host).href}`)
                        .trim();
                    item.pubDate = timezone(parseDate($('.timestyle207543').text().replace('发布时间：', '')), +8);
                }
                return item;
            })
        )
    );

    // 生成RSS源
    ctx.state.data = {
        // 项目标题
        title: '江苏海洋大学 -- 研招通知公告',
        // 项目链接
        link: url,
        // items的内容
        item: out,
    };
};
