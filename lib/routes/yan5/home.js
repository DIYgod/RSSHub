const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://www.yan5.top/';

const guess_date = (s) => {
    const m = /(\d+)(\S+)前/.exec(s);
    let now = new Date();
    if (!m) {
        return now.toUTCString();
    } else {
        const n = m[1],
            u = m[2];
        switch (u) {
            case '分钟':
                now -= n * 60 * 1000;
                break;
            case '小时':
                now -= n * 3600 * 1000;
                break;
            case '天':
                now -= n * 86400 * 1000;
                break;
        }
        return new Date(now).toUTCString();
    }
};

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: root_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.card-body > ul > li:not(.top_3)')
        .map((_, item) => {
            item = $(item);
            const a = item.find('div.subject > a');
            const date = item.find('span.date').text();
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: guess_date(date),
            };
        })
        .get();

    ctx.state.data = {
        title: '言屋',
        description: '一个提供网友学习交流分享的平台',
        link: root_url,
        item: list,
    };
};
