const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.nogizaka46.com';

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 25;

    const response = await got({
        method: 'get',
        url: `${rootUrl}/s/n46/api/list/news`,
        headers: {
            Referer: 'http://www.nogizaka46.com/',
        },
    });

    const data = JSON.parse(response.data.match(/res\((.*)\);/)[1]).data;
    const items = data.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link_url,
        description: item.text,
        pubDate: parseDate(item.date),
        category: item.cate,
        guid: rootUrl + new URL(item.link_url).pathname,
    }));

    ctx.state.data = {
        allowEmpty: true,
        title: '乃木坂46官网 NEWS',
        link: 'http://www.nogizaka46.com/news/',
        item: items,
    };
};
