const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

const titles = {
    '': '最新报道',
    1: '晚点独家',
    2: '人物访谈',
    3: '晚点早知道',
    4: '长报道',
};

module.exports = async (ctx) => {
    const proma = ctx.params.proma ?? '';

    const rootUrl = 'https://www.latepost.com';
    const currentUrl = `${rootUrl}/${proma ? 'site/index' : 'news/get-news-data'}`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        page: 1,
        programa: proma,
    });

    let items = response.data.data.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25).map((item) => ({
        title: item.title,
        link: `${rootUrl}${item.detail_url}`,
        category: item.label.map((l) => l.label),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('br').each(function () {
                    content(this).parent().remove();
                });

                const pubDate = content('.article-header-date').text();
                item.pubDate = timezone(/月|日/.test(pubDate) ? parseDate((/年/.test(pubDate) ? pubDate : `${new Date().getFullYear()}-${pubDate}`).replace(/年|月/g, '-').replace(/日/g, '')) : parseRelativeDate(pubDate), +8);

                item.description = content('#select-main').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[proma]} - 晚点`,
        link: currentUrl,
        item: items,
    };
};
