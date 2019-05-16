const axios = require('@/utils/axios');
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

    const response = await axios({
        method: 'get',
        url: base_url,
        // url:link,
        responseType: 'arraybuffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'utf-8'));

    ctx.state.data = {
        link: base_url,
        title: '大连大学教务处',
        item: $('td[valign="top"]>table[cellspacing="3"][width="100%"] tr')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('href')),
                title: $('a', elem).attr('title'),
                pubDate: new Date(
                    new Date().getFullYear() +
                        '-' +
                        $('[class*="timestyle"]', elem)
                            .text()
                            .replace('/', '-')
                ).toUTCString(),
            }))
            .get(),
    };
};
