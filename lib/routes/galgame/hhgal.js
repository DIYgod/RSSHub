const cheerio = require('cheerio');
const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.hhgal.com/';
    const stringToHex = (str) => {
        let val = '';
        for (let i = 0; i < str.length; i++) {
            if (val === '') {
                val = str.charCodeAt(i).toString(16);
            } else {
                val += str.charCodeAt(i).toString(16);
            }
        }
        return val;
    };

    const cookieJar = new CookieJar();
    const response = (
        await got({
            url: baseUrl,
            cookieJar,
        })
    ).body;
    let html = null;

    if (response.indexOf('YunSuoAutoJump') > -1) {
        const screenData = stringToHex('1280,720');
        const urlData = stringToHex(baseUrl);
        cookieJar.setCookie('srcurl=' + urlData, baseUrl);
        await got({
            url: baseUrl + '?security_verify_data=' + screenData,
            cookieJar,
        });
        html = (
            await got({
                url: baseUrl,
                cookieJar,
            })
        ).body;
    }

    const $ = html === null ? cheerio.load(response) : cheerio.load(html);
    const list = $('#article-list').find('.article');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.hhgal.com/',
        description: '忧郁的loli - Galgame资源发布站',
        item:
            list &&
            list
                .slice(1)
                .map((index, item) => {
                    item = $(item);
                    const time = `${item.find('.tag-article .label.label-zan').text()}`;
                    const math = /\d{4}-\d{2}-\d{2}/.exec(time);
                    const pubdate = new Date(math[0]);

                    return {
                        title: item.find('h1').text(),
                        description: `${item.find('.info p').text()}`,
                        pubDate: pubdate,
                        link: item.find('h1 a').attr('href'),
                    };
                })
                .get(),
    };
};
