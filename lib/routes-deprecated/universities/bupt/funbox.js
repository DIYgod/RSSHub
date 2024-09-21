const config = require('@/config').value;
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const cookie = config.btbyr.cookies;
    const url = config.btbyr.host || 'https://bt.byr.cn/';
    const response = await got({
        method: 'get',
        url: url + `log.php?action=funbox`,
        headers: {
            Referer: url,
            Cookie: cookie,
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('td.outer > table > tbody')
        .slice(2)
        .map((i, e) => ({
            title: $(e).find('tr > td.rowfollow').eq(0).text(),
            pubDate: new Date($(e).find('tr > td.rowfollow > span').attr('title')).toUTCString(),
            description: $(e)
                .find('tr > td.rowfollow')
                .eq(2)
                .html()
                .replaceAll(/https:\/\/bt.byr.cn\//g, url)
                .replaceAll(/onclick=.*findPosition\(this\)\[1]-58\);"/g, '')
                .replaceAll(/.thumb.jpg/g, ''),
            link: url + `log.php?action=funbox`,
            guid: new Date($(e).find('tr > td.rowfollow > span').attr('title')).getTime() / 1000,
        }))
        .get();

    ctx.state.data = {
        title: 'BTBYR - 趣味盒',
        link: url + `log.php?action=funbox`,
        item: list,
    };
};
