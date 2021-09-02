const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const tdfk = ctx.params.tdfk || false;
    const uri = tdfk ? `https://news.yahoo.co.jp/pages/article/covid19${tdfk}` : `https://news.yahoo.co.jp/pages/article/20200207`;
    const req_header = { 'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36' };

    const resp = await got({
        method: 'get',
        url: uri,
        headers: req_header,
    });

    const $ = cheerio.load(resp.data);

    const this_year = dayjs().year();
    const this_month = dayjs().month() + 1;

    const art_uri = [];
    $('#layoutFooter ul.dlpThumbLink a').each((i, e) => {
        const link = $(e).attr('href');
        const text = $(e).find('.dlpThumbText span').eq(0).text();
        const author = $(e).find('.dlpQuote').text();
        const date = $(e).find('.dlpDate').text() + ' +9'; // explicit timezone

        let date_obj = dayjs(date).year(this_year);

        if (date_obj.month() + 1 > this_month) {
            // if the article is from the last year
            date_obj = date_obj.year(this_year - 1);
        }

        art_uri.push({ l: link, t: text, a: author, d: date_obj.toString() });
    });

    const getNews = async (uri) => {
        const ret = {
            link: uri.l,
            title: uri.t,
            author: uri.a,
            pubDate: uri.d,
            description: null,
        };

        if (!uri.l.includes('//news.yahoo.co.jp')) {
            return ret; // do not process uncertain pages
        }

        const page_data = await ctx.cache.tryGet(uri.l, async () => {
            const resp = await got({
                method: 'get',
                url: uri.l,
                headers: req_header,
            });
            return resp.data;
        });

        const $doc = cheerio.load(page_data);

        const iso_date = $doc('meta[name="pubdate"]').attr('content');
        ret.pubDate = dayjs(iso_date).toString();
        ret.description = $doc('div.article_body').html() || $doc('meta[name="description"]').attr('content');

        return ret;
    };

    const items = await Promise.all(art_uri.map(getNews));

    ctx.state.data = {
        title: $('title').text(),
        link: uri,
        description: $('meta[name="description"]').attr('content'),
        item: items,
    };
};
