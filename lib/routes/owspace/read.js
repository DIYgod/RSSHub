const got = require('@/utils/got');
const md5 = require('@/utils/md5');
const qs = require('querystring');
const cheerio = require('cheerio');

const secret = 'fk4iy@98(*Y98fh-^o)re+wg=';

const typeMap = {
    1: '文字',
    2: '影像',
    3: '声音',
    4: '单向历',
    6: '谈论',
};

const signQuery = (query) => {
    query.sign = md5(['apiname=', query.a, 'device_id=', query.device_id, 'time=', query.time, secret].join(''));
};

const generateFullText = async (item) => {
    const model = parseInt(item.model);
    const fullTextResponse = await got.get(item.html5);
    const $ = cheerio.load(fullTextResponse.data);

    const content = $('#singleArticle');
    const describe = $('.articleTit>.describe');

    let intro = '';

    if (item.excerpt) {
        intro += '<p>' + item.excerpt + '</p>';
    }

    if (item.thumbnail) {
        intro += `<p><img src="${item.thumbnail}"></p>`;
    }

    if (describe.length > 0) {
        intro += '<blockquote>' + describe.html() + '</blockquote>';
    }

    if (intro) {
        intro += '<hr>';
    }

    // hide redundant meta
    content.find('.articleTit').remove();

    if (model === 2) {
        // make video visible
        content.find('.vBox').removeAttr('style');

        content.find('.vBox video').attr('preload', 'metadata');
    }

    if (model === 3) {
        // make audio visible
        const audioContainer = content.find('.fmCon').removeAttr('style');

        // generate audio player
        $('<audio controls="controls"></audio>')
            .attr('src', item.fm)
            .attr('preload', 'metadata')
            .prependTo(audioContainer);

        content.find('.fmCon>.graphic').remove();
        content.find('.fmCon>.fmDetail').remove();
    }

    return intro + content.html();
};

const handleItem = (ctx) => async (item) => {
    if (parseInt(item.model) === 4) {
        const result = {
            title: item.title.substring(0, 4) + '年' + parseInt(item.title.substring(4, 6)) + '月' + parseInt(item.title.substring(6, 8)) + '日',
            link: item.html5,
            description: `<img src="${item.thumbnail}">`,
            pubDate: new Date(Number(item.create_time) * 1000).toUTCString(),
            author: item.author,
        };

        return Promise.resolve(result);
    } else {
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
    }
};

module.exports = async (ctx) => {
    const selectedType = ctx.params.type !== undefined ? parseInt(ctx.params.type) : 0;

    const queryData = {
        c: 'api2',
        a: 'getList',
        p: '1',
        model: selectedType,
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
        searchParams: qs.stringify(queryData),
        headers: {
            'User-Agent': 'com.onewaystreet.weread/14',
        },
    });

    if (!response.data.status || response.data.status !== 'ok') {
        throw response.data.msg ? 'api error: ' + response.data.msg : 'api error';
    }

    const responseItemArray = response.data.datas.filter((item) => parseInt(item.model) !== 5);

    const feedItemArray = await Promise.all(responseItemArray.map(handleItem(ctx)));

    const selectedTypeName = typeMap[selectedType];

    ctx.state.data = {
        title: selectedTypeName ? `${selectedTypeName} - 单读` : '单读',
        link: 'http://www.owspace.com/read.html',
        item: feedItemArray,
    };
};
