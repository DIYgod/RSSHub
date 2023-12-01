const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

const baseUrl = 'https://cs.whu.edu.cn';

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);

    let link;
    if (type === 0) {
        link = `${baseUrl}/xwdt/xyxw.htm`; // 学院新闻
    } else if (type === 1) {
        link = `${baseUrl}/kxyj/xsjl.htm`; // 学术交流
    } else if (type === 2) {
        link = `${baseUrl}/xwdt/tzgg.htm`; // 通知公告
    } else if (type === 3) {
        link = `${baseUrl}/kxyj/kyjz.htm`; // 科研进展
    }

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const list = $('div.study ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a p').text().trim(),
                pubDate: parseDate(item.find('span').text()),
                link: new URL(item.find('a').attr('href'), link).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                if ($('.prompt').length) {
                    item.description = $('.prompt').html();
                    return item;
                }

                const content = $('.content');

                content.find('img').each((_, e) => {
                    e = $(e);
                    if (e.attr('orisrc')) {
                        e.attr('src', new URL(e.attr('orisrc'), response.url).href);
                        e.removeAttr('orisrc');
                        e.removeAttr('vurl');
                    }
                });

                item.description = content.html();
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8) : item.pubDate;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').first().text(),
        link,
        item: items,
    };
};
