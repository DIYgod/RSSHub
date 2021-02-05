const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();
    const date = ctx.params.date || `${today.getFullYear()}${todayMonth < 10 ? `0${todayMonth}` : todayMonth}${todayDate < 10 ? `0${todayDate}` : todayDate}`;

    const rootUrl = 'http://hk.hkcd.com';
    const currentUrl = `${rootUrl}/pdf/${date.substr(0, 6)}/${date.substr(4, 4)}/${date}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312').replace('<table width="177" border="0" cellspacing="1" cellpadding="0"', '<table id="content" width="177" border="0" cellspacing="1" cellpadding="0"'));

    ctx.state.data = {
        title: '香港商报PDF版',
        link: currentUrl,
        item: [
            {
                title: date,
                link: currentUrl,
                description: $('#content').html(),
            },
        ],
    };
};
