const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://m.hanhande.com/op/',
        responseType: 'arraybuffer',
        headers: {
            Referer: 'http://m.hanhande.com/op/',
            "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        },
    });
    // var ctype = response.headers["content-type"];

    // if (ctype.includes("charset=GB2312"))
    //     var data = iconv.decode(response.data, 'gb2312');
    // else
    //     data = iconv.decode(response.data, 'utf-8');
     const data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(data);
    const list = $('ul.dmph').eq(1).find('li');
    var millsec=new Date().getTime();
    ctx.state.data = {
        title: '海贼王hanhan',
        link: 'http://m.hanhande.com/op/',
        description: '海贼王漫画',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: `${item.find('a').attr('title')}`,
                        pubDate: new Date(millsec-index*1000).toUTCString(),
                        link: `${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};