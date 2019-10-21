const config = require('@/config').value;
const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

function isToday(time) {
    return new Date().getTime() - new Date(time).getTime() < 86400000;
}

function getPubDate(time) {
    return isToday(time) ? new Date() : new Date(time + ' 08:00:00');
}

const base = 'http://my.bupt.edu.cn';
const sourceTimezoneOffset = -8;

let portalCookie = null;
let authCookie = null;
let castgc = null;

module.exports = async (ctx) => {
    if (!config.bupt || !config.bupt.username || !config.bupt.password) {
        throw 'BUPT Portal RSS is disabled due to the lack of <a href="https://docs.rsshub.app/university.html#bei-jing-you-dian-da-xue">relevant config</a>';
    }

    const reqUrl = url.resolve(base, '/index.portal?.pn=p1778');
    let reqRes = await got({
        method: 'get',
        followRedirect: false,
        url: reqUrl,
        headers: {
            cookie: portalCookie,
        },
    });

    // Login
    if (reqRes.statusCode === 302) {
        if (reqRes.headers['set-cookie'] === undefined) {
            portalCookie = null;
            throw 'Can not obtain portalCookie';
        }
        portalCookie = reqRes.headers['set-cookie'].toString().match(/JSESSIONID=.{37}/)[0];

        const authRes = await got({
            method: 'get',
            followRedirect: false,
            url: reqRes.headers.location,
            headers: {
                cookie: `${authCookie}; ${castgc}`,
            },
        });
        if (authRes.statusCode === 200) {
            authCookie = authRes.headers['set-cookie'].toString().match(/JSESSIONID=.{37}/)[0];
            const authPage = cheerio.load(authRes.data);

            const loginRes = await got({
                method: 'post',
                followRedirect: false,
                url: reqRes.headers.location,
                headers: {
                    cookie: authCookie,
                    referer: reqRes.headers.location,
                },
                form: true,
                data: {
                    username: config.bupt.username,
                    password: config.bupt.password,
                    lt: authPage('[name=lt]').attr('value'),
                    execution: authPage('[name=execution]').attr('value'),
                    _eventId: authPage('[name=_eventId]').attr('value'),
                    rmShown: 1,
                },
            });
            if (loginRes.headers['set-cookie'] === undefined) {
                authCookie = null;
                castgc = null;
                throw 'Can not obtain castgc';
            }
            castgc = loginRes.headers['set-cookie'].toString().match(/CASTGC=.{85}/)[0];

            await got({
                method: 'get',
                followRedirect: false,
                url: loginRes.headers.location,
                headers: {
                    cookie: portalCookie,
                },
            });
        } else if (authRes.statusCode === 302) {
            await got({
                method: 'get',
                followRedirect: false,
                url: authRes.headers.location,
                headers: {
                    cookie: portalCookie,
                },
            });
        } else {
            throw 'BUPT auth login failed';
        }

        reqRes = await got({
            method: 'get',
            followRedirect: false,
            url: reqUrl,
            headers: {
                cookie: portalCookie,
            },
        });
    }

    const $ = cheerio.load(reqRes.data);
    const list = $('.newslist li').get();
    const out = await Promise.all(
        list.map(async (i) => {
            const item = $(i);
            const itemUrl = url.resolve(
                base,
                $(item)
                    .find('a')
                    .attr('href')
            );
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const title = $(item)
                .find('a')
                .text();
            const author = $(item)
                .find('.author')
                .text();
            const time = getPubDate(
                $(item)
                    .find('.time')
                    .text()
            );
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);

            const itemResponse = await got({
                method: 'get',
                url: itemUrl,
                headers: {
                    cookie: portalCookie,
                },
            });
            const itemElement = cheerio.load(itemResponse.data);
            // Remove useless print button
            itemElement('table.Noprint').remove();
            const description = itemElement('.singleexpert').html();

            const single = {
                title: title,
                author: author,
                description: description,
                pubDate: time.toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '北京邮电大学信息门户',
        link: reqUrl,
        item: out,
    };
};
