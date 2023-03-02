const utils = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://chn.oversea.cnki.net/kcms/detail/frame/knetlist.aspx?infotype=4&codetype=1&vl=&';
const authorPageRootUrl = 'https://kns.cnki.net/kcms/detail/knetsearch.aspx?sfield=au&';

module.exports = async (ctx) => {
    const { code } = ctx.params;

    const authorPageUrl = `${authorPageRootUrl}code=${code}`;

    const res = await got(authorPageUrl);
    const $ = cheerio.load(res.data);
    const authorName = $('#showname').text();
    const companyName = $('body > div.wrapper > div.main > div.container.full-screen > div > div:nth-child(3) > h3:nth-child(2) > span > a').text();

    const url = `${rootUrl}code=${code}`;

    const list = await got
        .get(url, {
            headers: {
                Referer: authorPageUrl,
            },
        })
        .then((res) => {
            const $ = cheerio.load(res.data);
            const list = $('.bignum')
                .children()
                .map((_, e) => ({
                    title: $(e).find('a').first().text().trim(),
                    link: 'https://chn.oversea.cnki.net' + $(e).find('a').first().attr('href'),
                }))
                .get();
            return list;
        });

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => utils.ProcessItem(item))));

    ctx.state.data = {
        title: `知网 ${authorName} ${companyName}`,
        link: authorPageUrl,
        item: items,
    };
};
