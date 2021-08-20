const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const fs = require('fs');
const path = require('path');

const domain = 'https://www.solidot.org';

module.exports = async function get_article(url) {
    if (/^\/.*$/.test(url)) {
        url = domain + url;
    }
    const response = await got({
        method: 'get',
        url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
        https: {
            certificateAuthority: [fs.readFileSync(path.resolve(__dirname, './wotrust.pem')), fs.readFileSync(path.resolve(__dirname, './sectigo.pem'))],
            rejectUnauthorized: true,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const date_raw = $('div.talk_time').clone().children().remove().end().text();
    const date_str_zh = date_raw.replace(/^[^`]*发表于(.*分)[^`]*$/g, '$1'); // use [^`] to match \n
    const date_str = date_str_zh.replace(/[年月]/g, '-').replace(/时/g, ':').replace(/[日分]/g, '');
    let date = new Date(date_str);
    date.setHours(date.getHours() - 8);
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    const title = $('div.block_m > div.ct_tittle > div.bg_htit > h2').text();
    const category = $('div.icon_float > a').attr('title');
    const author = $('div.talk_time > b')
        .text()
        .replace(/^来自(.*)部门$/g, '$1');
    $('div.ct_tittle').remove();
    $('div.talk_time').remove();
    const description = $('div.block_m')
        .html()
        .replace(/(href.*?)<u>(.*?)<\/u>/g, `$1$2`)
        .replace(/href="\//g, 'href="' + domain + '/')
        // Preserve the not extremely disturbing donation ad
        // to support the site.
        .replace(/(<img.*liiLIZF8Uh6yM.*?>)/g, `<br><br>$1`);

    const item = {
        title,
        pubDate: date.toUTCString(),
        author,
        link: url,
        description,
        category,
    };
    return item;
};
