const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

// https://www.natgeomedia.com//article/

async function load(link) {
    const { data } = await got(link);
    const $ = cheerio.load(data);
    const dtStr = $('.content-title-area')
        .find('h6')
        .first()
        .html()
        .replace(/&nbsp;/gi, ' ')
        .trim();

    let description = $('article').first().html() + $('article').eq(1).html();
    if (/photo/.test(link)) {
        description = $('#content-album').html() + description;
    }
    return {
        title: $('title').text(),
        pubDate: parseDate(dtStr, 'MMM. DD YYYY'),
        description,
    };
}

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '';
    const url = `https://www.natgeomedia.com/${ctx.params.cat}/${type}`;
    const res = await got(url);
    const $ = cheerio.load(res.data);

    const urlList = $('.article-link-w100')
        .find('.read-btn')
        .toArray()
        .map((i) => ({
            link: $(i).find('a[href]').first().attr('href'),
        }));

    const out = await Promise.all(
        urlList.map(async (i) => {
            const link = i.link;
            const single = {
                link,
            };
            const other = await ctx.cache.tryGet(link, () => load(link));
            return { ...single, ...other };
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
