const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    nba: 'NBA',
    zuqiu: '足球',
    dianjing: '电竞',
    other: '综合',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'nba';

    const rootUrl = 'https://news.zhibo8.cc';

    let list,
        apiUrl = '',
        currentUrl = '',
        response;

    if (category === 'nba' || category === 'zuqiu') {
        currentUrl = `${rootUrl}/${category}/more.htm`;

        response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = cheerio.load(response.data);

        list = $('ul.articleList li')
            .slice(0, 30)
            .map((_, item) => {
                item = $(item);
                const a = item.find('a');

                return {
                    title: a.text(),
                    link: `http:${a.attr('href')}`,
                    pubDate: timezone(parseDate(item.find('span.postTime').text()), +8),
                };
            })
            .get();
    } else {
        currentUrl = `${rootUrl}/${category}`;
        apiUrl = `https://api.qiumibao.com/application/app/index.php?_url=/news/${category}List`;

        response = await got({
            method: 'get',
            url: apiUrl,
        });

        list = response.data.data.list.map((item) => ({
            title: item.title,
            link: `https:${item.url}`,
            pubDate: timezone(parseDate(item.createtime), +8),
        }));
    }

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(res.data);

                item.description = content('div.content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${categories[category]} - 直播吧`,
        link: currentUrl,
        item: items,
    };
};
