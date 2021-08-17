const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    //    const category = ctx.params.category;

    const baseUrl = 'https://news.cqu.edu.cn/';
    const url = 'https://news.cqu.edu.cn/newsv2/list-18.html';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const nowDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const links = $('div[class=lists]', 'div[class="container newslist"]')
        .find('div[class="content w100"]', 'div[class="item"]')
        .map((index, item) => {
            item = $(item);
            const a = item.find('a[href]');
            const dateText = item.find('div[class=rdate]').text().trim();
            const month = dateText.slice(0, 2);
            const day = dateText.slice(2, 4);
            const year = String((Number(month) === nowDate.getMonth() + 1 && Number(day) <= nowDate.getDate()) || Number(month) < nowDate.getMonth() + 1 ? nowDate.getFullYear() : nowDate.getFullYear() - 1);
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: `${year}-${month}-${day}T00:00+08:00`,
            };
        })
        .get();

    const items = await Promise.all(
        [...links].map(async ({ title, link, pubDate }) => {
            const item = {
                title,
                link,
                pubDate,
            };
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }
            const response = await got({
                method: 'get',
                url: baseUrl + link,
            });
            const $ = cheerio.load(response.data);
            const newsContent = $('div[class=content]', 'div[class="container detail"]');

            item.description = newsContent.find('div[class=acontent]').html();

            const authorStrings = newsContent
                .find('p', 'div[class=dinfoa]')
                .find('a[href="javascript:;"]')
                .map((index, item) => $(item).text());
            item.author = `${authorStrings[0]}-${authorStrings[1]}`;

            ctx.cache.set(item.link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $.title,
        item: items.filter((x) => x),
    };
};
