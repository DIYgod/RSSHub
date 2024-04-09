const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const types = {
    newslist: 'newsList',
    r18list: 'newsPornList',
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'newslist';
    const category = ctx.params.category ?? 'all';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://news.gamebase.com.tw';
    const currentUrl = `${rootUrl}/news/${type}?type=${category}`;

    const apiRootUrl = 'https://api.gamebase.com.tw';
    const apiUrl = `${apiRootUrl}/api/news/getNewsList`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            GB_type: types[type],
            category,
            page: 1,
        },
    });

    const titleResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(titleResponse.data);

    const items = await Promise.all(
        response.data.return_msg.list.slice(0, limit).map((item) =>
            ctx.cache.tryGet(`gamebase:news:${type}:${category}:${item.news_no}`, async () => {
                const i = {};

                i.author = item.nickname;
                i.title = item.news_title;
                i.link = `${rootUrl}/news/detail/${item.news_no}`;
                i.description = item.news_meta?.meta_des ?? '';
                i.pubDate = timezone(parseDate(item.post_time), +8);
                i.category = [item.system];

                if (i.description) {
                    return i;
                }

                const detailResponse = await got({
                    method: 'get',
                    url: i.link,
                });

                const description = detailResponse.data.match(/(\\u003C.*?)","/)[1].replace(/\\"/g, '"');

                i.description = description.replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)));

                return i;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
