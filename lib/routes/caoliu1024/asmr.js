const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'http://caoliu1024.com/rss.php?fid=15';

module.exports = async (ctx) => {

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Host: 'caoliu1024.com',
            Referer: 'http://caoliu1024.com/rss.php?fid=15',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
        }
    });
    const data = response.data;

    const $ = cheerio.load(data, {
        normalizeWhitespace: true,
        xmlMode: true
    });
    const elems = $('item link');
    console.log(elems.length);
    ctx.state.data = {
        title: 'caoliu1024_asmr',
        link: url,
        item: items,
    };

}