const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const rootUrl = 'http://hk.hkcd.com';
    const currentUrl = `${rootUrl}/pdf/index.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312');
    const date = data.match(/<td align="right"><font color="#FFFFFF">(.*)/)[1];
    const $ = cheerio.load(data.replace('<table width="177" border="0" cellspacing="1" cellpadding="0"', '<table id="content" width="177" border="0" cellspacing="1" cellpadding="0"'));

    ctx.state.data = {
        title: '香港商报PDF版',
        link: currentUrl,
        item: [
            {
                title: date,
                link: currentUrl,
                description: $('#content').html(),
                pubDate: new Date(date.replace(/年|月/g, '-').replace(/日/, '')).toUTCString(),
            },
        ],
    };
};
