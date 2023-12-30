const got = require('@/utils/got');
const cheerio = require('cheerio');
function evil(fn) {
    const Fn = Function; // 一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + fn)();
}
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';

const instance = got.extend({
    headers: {
        'User-Agent': userAgent,
    },
    hooks: {
        afterResponse: [
            (response) => {
                try {
                    JSON.parse(response.body);
                    return response;
                } catch (e) {
                    const $ = cheerio.load(response.body);
                    const redirect = $('meta[http-equiv="refresh"]');
                    if (!(redirect.length > 0)) {
                        return response;
                    }
                    let [, url] = redirect.attr('content').split(';');
                    url = url.trim();
                    if (url.startsWith('url=')) {
                        url = url.slice(4);
                    }

                    return instance.get({
                        url,
                        headers: {
                            Referer: response.url,
                        },
                    });
                }
            },
        ],
    },
    mutableDefaults: true,
});

module.exports = {
    instance,
    evil,
};
