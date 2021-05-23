const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://jiaowu.dlpu.edu.cn';

const map = {
    2: '/more/2',
    3: '/more/3',
    4: '/more/4',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || '2';
    const link = `${base_url}${map[type]}`;

    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));

    ctx.state.data = {
        link: link,
        title: $('#more>h1').text(),
        item: $('.more_list>li')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(base_url, $('a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate: new Date(
                    $('a>span', elem)
                        .text()
                        .replace(/.(\d+)年(\d+)月(\d+)日./, '$1-$2-$3')
                ).toUTCString(),
            }))
            .get(),
    };
};
