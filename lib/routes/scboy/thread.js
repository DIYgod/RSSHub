const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const tid = ctx.params.tid;
    const link = `https://www.scboy.com/?thread-${tid}.htm`;
    let cookieString = 'postlist_orderby=desc';
    if (config.scboy.token) {
        cookieString = `postlist_orderby=desc; bbs_token=${config.scboy.token}`;
    }

    const res = await got.get({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Cookie: cookieString,
        },
    });

    const $ = cheerio.load(res.data);
    const title = $('h4 > span:nth-of-type(1)').text();

    const list = $('li.media.post');
    const count = [];

    for (let i = 0; i < Math.min(list.length, 30); i++) {
        count.push(i);
    }

    const resultItems = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const floor = each.find('span.floor-parent').text();
            const item = {
                title: `${title} #${floor ? floor : ' 热门回复'}`,
                link: `https://www.scboy.com/?thread-${tid}`,
                description: each.find('div.message.mt-1.break-all > div:nth-of-type(1)').html(),
                author: each.find('username').text(),
                pubDate: date(each.find('.date').text()),
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: title,
        link: `https://www.scboy.com/?thread-${tid}.htm`,
        item: resultItems,
    };
};
