const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

// Yep http is bad, but I had no choice :(
const rootMeta = {
    url: 'http://jiaowu.xaufe.edu.cn/',
    title: '西安财经大学 教务处（招生办公室）',
};

const categories = {
    tzgg: {
        title: '通知公告',
        url: 'index/tzgg.htm',
    },
};

module.exports = async (ctx) => {
    const pCategory = ctx.params.category;
    const category = categories[pCategory] || categories.tzgg;

    const response = (
        await got({
            method: 'get',
            url: rootMeta.url + category.url,
        })
    ).body;

    const $ = cheerio.load(response);

    const data = $('ul', '.main_conRCb')
        .children('li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const pubDate = item.children('span').text();
            const title = item.find('a em').text();
            const link = item
                .children('a')
                .attr('href')
                .replace(/\.\.\//g, rootMeta.url);
            return {
                pubDate: parseDate(pubDate),
                title,
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: `${category.title}-${rootMeta.title}`,
        link: rootMeta.url + category.url,
        description: `${category.title}-${rootMeta.title}`,
        language: 'zh_CN',
        item: await Promise.all(
            data.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const $ = cheerio.load(
                        (
                            await got({
                                method: 'get',
                                url: item.link,
                            })
                        ).body
                    );
                    return {
                        title: item.title,
                        author: /作者：(\S*)\s{4}/g.exec($('p', '.main_contit').text())[1],
                        description: $('#vsb_content').html(),
                        pubDate: item.pubDate,
                        link: item.link,
                    };
                })
            )
        ),
    };
};
