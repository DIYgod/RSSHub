const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://jwc1.dlu.edu.cn/';

// const map = {
//     2: '/gsgg.htm',
//     3: '/jwtz.htm',
//     4: '/jwwj.htm',
//     5: '/xxwj.htm'
// };
module.exports = async (ctx) => {
    // const type = ctx.params.type || '2';
    // const link = `${base_url}${map[type]}`;

    const response = await got({
        method: 'get',
        url: base_url,
        // url:link,
        responseType: 'buffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'utf-8'));

    const regex = /(\d+)\.htm/;

    ctx.state.data = {
        link: base_url,
        title: '大连大学教务处',
        item: $('td[valign="top"]>table[cellspacing="3"][width="100%"] tr')
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('href')),
                title: $('a', elem).attr('title'),
                pubDate: new Date(new Date().getFullYear() + '-' + $('[class*="timestyle"]', elem).text().replace('/', '-')).toUTCString(),
            }))
            .get()
            .sort((one, two) => two.link.match(regex)[1] - one.link.match(regex)[1])
            .slice(0, 20),
    };
};
