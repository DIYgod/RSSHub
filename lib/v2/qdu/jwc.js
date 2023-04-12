const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const base = 'https://jwc.qdu.edu.cn/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${base}jwtz.htm`,
    });

    const $ = cheerio.load(response.data);
    const list = $('.notice_item').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('.active').text();
            const itemDate = item.find('span').text();
            const path = item.find('.active').attr('href');
            let itemUrl = '';
            if (!path.startsWith('http')) {
                itemUrl = base + path;
            } else {
                itemUrl = path;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (!path.startsWith('http')) {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    if ($('title').text() === '系统提示') {
                        // 内网限制访问内容，仅返回标题
                        description = itemTitle;
                    } else {
                        description = $('.v_news_content').html().trim();
                    }
                } else {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: '青岛大学 - 教务处通知',
        link: `${base}jwtz.htm`,
        description: '青岛大学 - 教务处通知',
        item: items,
    };
};
