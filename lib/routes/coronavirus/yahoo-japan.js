const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tdfk = ctx.params.tdfk || false;
    const uri = tdfk ? `https://news.yahoo.co.jp/pages/article/covid19${tdfk}` : `https://news.yahoo.co.jp/pages/article/20200207`;
    const req_header = { 'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36' };
    const responst = await got({
        method: 'get',
        url: uri,
        headers: req_header,
    });

    const $ = cheerio.load(responst.data);
    const art_uri = [];
    $('#layoutFooter ul.dlpThumbLink a').each((i, e) => {
        const link = $(e).attr('href');
        const text = $(e).find('.dlpThumbText span').eq(0).text();
        const author = $(e).find('.dlpQuote').text();
        if (!link.includes('//news.yahoo.co.jp')) {
            return; // too lazy to process `12/31(月) 23:59` format :)
        }
        art_uri.push({ l: link, t: text, a: author });
    });

    const getNews = async (uri) => {
        const ret = {
            link: uri.l,
            title: uri.t,
            author: uri.a,
            pubDate: null,
            description: null,
        };

        const resp = await got({
            method: 'get',
            url: uri.l,
            headers: req_header,
        });

        const $doc = cheerio.load(resp.data);
        const iso_date = $doc('meta[name="pubdate"]').attr('content');
        ret.pubDate = new Date(iso_date).toUTCString();
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
