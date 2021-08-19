const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;

    const res = await got.get('https://bbs.saraba1st.com/2b/forum.php', {
        searchParams: queryString.stringify({
            mod: 'viewthread',
            tid,
            ordertype: 1,
        }),
    });

    const $ = cheerio.load(res.data);
    const title = $('#thread_subject').text();

    const list = $('#postlist > div[id^=post_]:not(:first-of-type)');
    const count = [];

    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItems = count.map((i) => {
        const each = $(list[i]);
        const floor = each.find('td.plc .pi a > em').text();
        const floorUrl = each.find('td.plc .pi a').attr('href');
        return {
            title: `${title} #${floor}`,
            link: url.resolve('https://bbs.saraba1st.com/2b/', floorUrl),
            description: each.find('td.t_f').html(),
            author: each.find('.authi .xw1').text(),
            pubDate: date(each.find('.authi em').text()),
        };
    });

    ctx.state.data = {
        title: `Stage1 论坛 - ${title}`,
        link: `https://bbs.saraba1st.com/2b/thread-${tid}-1-1.html`,
        item: resultItems,
    };
};
