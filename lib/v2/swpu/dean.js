const { joinUrl } = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const url = `https://www.swpu.edu.cn/dean/${ctx.params.code}.htm`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    let title = $('.r_list > h3').text();
    title = title.substring(title.indexOf('：') + 1);

    // 获取标题、时间及链接
    const items = [];
    $('.r_list > ul > li').each((i, elem) => {
        items.push({
            title: $('label:eq(0)', elem).text().trim(),
            link: joinUrl('https://www.swpu.edu.cn/dean/', $('a', elem).attr('href')),
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
                item.author = '教务处';
                item.description = $('.v_news_content').html();
                item.pubDate = timezone(parseDate($('#lbDate').text(), '更新时间：YYYY年MM月DD日'), +8);
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
        title: `西南石油大学教务处 ${title}`,
        link: url,
        description: `西南石油大学教务处 ${title}`,
        language: 'zh-CN',
        item: out,
    };
};
