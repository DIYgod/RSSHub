const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
let titletype = '';

module.exports = async (ctx) => {
    const rootUrl = 'https://www.ghxi.com';
    const type = ctx.params.category ?? 'new';
    const currentUrl = `${rootUrl}/ghapi?type=query&n=${type}`;

    const response = await got({
      method: 'get',
      url: currentUrl,
      responseType: 'json',
    });

    const data = response.body;


    const items = data.data.list.map((item, index) => ({
        title: item.title,
        pubDate: parseDate(item.time),
        link: item.url,
    }));

    const lastTime = parseDate(data.last_time);

    switch (type) {
        case 'new':
            titletype = '最新';
            break;
        case 'pc':
            titletype = '电脑';
            break;
        case 'and':
            titletype = '安卓';
            break;
        default:
            titletype = '最新';
    }

    ctx.state.data = {
        title: `果核剥壳 - ${titletype}`,
        link: currentUrl,
        item: items,
        lastBuildDate: lastTime,
        pubDate: lastTime,
    };
};

