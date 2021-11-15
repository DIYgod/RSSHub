import got from '~/utils/got.js';
import cheerio from 'cheerio';
import date from '~/utils/date.js';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const config = require('~/config').value;

export default async (ctx) => {
    const {
        tid
    } = ctx.params;
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

    const resultItems = count.map((i) => {
        const each = $(list[i]);
        const floor = each.find('span.floor-parent').text();
        return {
            title: `${title} #${floor || ' 热门回复'}`,
            link: `https://www.scboy.com/?thread-${tid}`,
            description: each.find('div.message.mt-1.break-all > div:nth-of-type(1)').html(),
            author: each.find('username').text(),
            pubDate: date(each.find('.date').text()),
        };
    });

    ctx.state.data = {
        title,
        link: `https://www.scboy.com/?thread-${tid}.htm`,
        item: resultItems,
    };
};
