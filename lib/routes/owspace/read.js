const got = require('@/utils/got');
const md5 = require('@/utils/md5');
const qs = require('querystring');
const cheerio = require('cheerio');

const secret = 'fk4iy@98(*Y98fh-^o)re+wg=';
const signQuery = (query) => {
    query.sign = md5(['apiname=', query.a, 'device_id=', query.device_id, 'time=', query.time, secret].join(''));
};

const generateFullText = async (item) => {
    const fullTextResponse = await got.get(item.html5);
    const $ = cheerio.load(fullTextResponse.data);

    const content = $('#singleArticle');
    const describe = $('.articleTit>.describe');

    let intro = '';

    if (item.thumbnail) {
        intro += `<p><img src="${item.thumbnail}"></p>`;
    }

    if (item.excerpt) {
        intro += '<blockquote>' + item.excerpt + '</blockquote><br>';
    }

    if (describe.length > 0) {
        intro += '<p>' + describe.html() + '</p><hr>';
    }

    content.find('.articleTit').remove();

    return intro + content.html();
};

module.exports = async (ctx) => {
    const queryData = {
        c: 'api2',
        a: 'getList',
        p: '1',
        model: '0',
        client: 'android',
        version: '1.6.3',
        time: Math.round(Date.now() / 1000),
        device_id: 'null',
        show_sdv: '0',
    };

    signQuery(queryData);
    const response = await got({
        method: 'get',
        url: 'http://static.owspace.com/',
        query: qs.stringify(queryData),
        headers: {
            'User-Agent': 'com.onewaystreet.weread/14',
        },
    });

    if (!response.data.status || response.data.status !== 'ok') {
        throw response.data.msg ? 'api error: ' + response.data.msg : 'api error';
    }

    const itemArray = await Promise.all(
        response.data.datas
            .filter((item) => item.model !== 5)
            .map(async (item) => {
                const url = item.html5;
                const cache = await ctx.cache.get(url);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const result = {
                    title: item.title.replace('\r\n', ''),
                    link: item.html5,
                    description: await generateFullText(item),
                    pubDate: new Date(Number(item.create_time) * 1000).toUTCString(),
                    author: item.author,
                };

                ctx.cache.set(url, JSON.stringify(result));
                return Promise.resolve(result);
            })
    );

    ctx.state.data = {
        title: '单读',
        link: 'http://www.owspace.com/read.html',
        item: itemArray,
    };
};
