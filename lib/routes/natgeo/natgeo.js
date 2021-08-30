const cheerio = require('cheerio');
const got = require('@/utils/got');

// https://www.natgeomedia.com//article/

const MonthMap = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
};

async function load(link) {
    const { data } = await got.get(link);
    const $ = cheerio.load(data);
    const dtStr = $('.content-title-area')
        .find('h6')
        .first()
        .text()
        .split(/[\s.]+/);
    const dt = new Date();
    dt.setMonth(MonthMap[dtStr[0].toUpperCase()]);
    dt.setDate(dtStr[1]);
    let description = $('article').first().html() + $('article').eq(1).html();
    if (/photo/.test(link)) {
        description = $('#content-album').html() + description;
    }
    return {
        title: $('title').text(),
        pubDate: dt.toUTCString(),
        description,
    };
}

module.exports = async (ctx) => {
    const type = `${ctx.params.type || ''}`;
    const url = `https://www.natgeomedia.com/${ctx.params.cat}/${type}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const urlList = Array.prototype.map.call($('.article-link-w100').find('.read-btn'), (i) => $(i).find('a[href]').first().attr('href'));

    const count = [];
    for (let i = 0; i < Math.min(urlList.length, 10); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const link = urlList[i];
            const single = {
                link,
            };
            const other = await ctx.cache.tryGet(link, () => load(link));
            return Object.assign({}, single, other);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
