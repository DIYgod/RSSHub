const { joinUrl } = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    // 移除 urltype=tree.TreeTempUrl 虽然也能顺利访问页面，
    // 但标题会缺失，而且在其他地方定位提取标题也比较麻烦。
    const url = `https://www.swpu.edu.cn/dxy/list1.jsp?urltype=tree.TreeTempUrl&wbtreeid=${ctx.params.code}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    let title = $('title').text();
    title = title.substring(0, title.indexOf('-'));

    // 获取标题、时间及链接
    const items = [];
    $('tr[height="20"]').each((i, elem) => {
        items.push({
            title: $('a[title]', elem).text().trim(),
            pubDate: timezone(parseDate($('td:eq(1)', elem).text(), 'YYYY年MM月DD日'), +8),
            link: joinUrl('https://www.swpu.edu.cn/dxy/', $('a[title]', elem).attr('href')),
        });
    });

    // 请求全文
    const out = await Promise.all(
        items.map(async (item) => {
            const $ = await ctx.cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                return cheerio.load(res.data);
            });

            if ($('title').text().startsWith('系统提示')) {
                item.author = '系统';
                item.description = '无权访问';
            } else {
                item.author = '电气信息学院';
                item.description = $('.v_news_content').html();
                for (const elem of $('.v_news_content p')) {
                    if ($(elem).css('text-align') === 'right') {
                        item.author = $(elem).text();
                        break;
                    }
                }
            }

            return item;
        })
    );

    ctx.state.data = {
        title: `西南石油大学电气信息学院 ${title}`,
        link: url,
        description: `西南石油大学电气信息学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
};
