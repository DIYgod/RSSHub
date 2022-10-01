const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const url = `https://www.swpu.edu.cn/nccjxy/xydt/${ctx.params.code}.htm`;

    const res = await got(url);
    const $ = cheerio.load(res.data);

    let title = $('title').text();
    title = title.substring(0, title.indexOf('-'));

    const items = $('.main_conRCb > ul > li')
        .toArray()
        .map((elem) => ({
            title: $('a[href]', elem).text().trim(),
            pubDate: timezone(parseDate($('span', elem).text(), 'YYYY年MM月DD日'), +8),
            link: `https://www.swpu.edu.cn/nccjxy/${$('a[href]', elem).attr('href').split('../')[1]}`,
        }));

    const out = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const $ = cheerio.load(res.data);
                if ($('title').text().startsWith('系统提示')) {
                    item.author = '系统';
                    item.description = '无权访问';
                } else {
                    item.author = '财经学院';
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
        )
    );

    ctx.state.data = {
        title: `西南石油大学财经学院 ${title}`,
        link: url,
        description: `西南石油大学财经学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
};
