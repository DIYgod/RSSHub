const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const request = require('request');

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

    const jar = request.jar();

    let response = await cloudscraper({
        uri: baseUrl,
        jar: jar,
    });

    if (response.indexOf('YunSuoAutoJump') > -1) {
        const screenData = stringToHex('1280,720');
        const urlData = stringToHex(baseUrl);
        jar.setCookie('srcurl=' + urlData, baseUrl);
        response = await cloudscraper({
            uri: baseUrl + '?security_verify_data=' + screenData,
            jar: jar,
        });
        response = await cloudscraper({
            uri: baseUrl,
            jar: jar,
        });
    }

    const $ = cheerio.load(response);
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
