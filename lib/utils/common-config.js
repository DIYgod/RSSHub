const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');
// eslint-disable-next-line no-unused-vars
const date = require('@/utils/date');
// eslint-disable-next-line no-unused-vars
const { parseDate } = require('@/utils/parse-date');
// eslint-disable-next-line no-unused-vars
const timezone = require('@/utils/timezone');

function transElemText($, prop) {
    const regex = new RegExp(/\$\((.*)\)/g);
    let result = prop;
    if (regex.test(result)) {
        // eslint-disable-next-line no-eval
        result = eval(result);
    }
    return result;
}

function replaceParams(data, prop, $) {
    const regex = new RegExp(/%(.*)%/g);
    let result = prop;
    let group = regex.exec(prop);
    while (group) {
        // FIXME Multi vars
        result = result.replace(group[0], transElemText($, data.params[group[1]]));
        group = regex.exec(prop);
    }
    return result;
}

function getProp(data, prop, $) {
    let result = data;
    if (Array.isArray(prop)) {
        for (const e of prop) {
            result = transElemText($, result[e]);
        }
    } else {
        result = transElemText($, result[prop]);
    }
    return replaceParams(data, result, $);
}

async function buildData(data) {
    const response = await got.get(data.url);
    const contentType = response.headers['content-type'] || '';
    // 若没有指定编码，则默认utf-8
    let charset = 'utf-8';
    for (const attr of contentType.split(';')) {
        if (attr.indexOf('charset=') >= 0) {
            charset = attr.split('=').pop();
        }
    }
    const responseData = charset === 'utf-8' ? response.data : iconv.decode((await got.get({ url: data.url, responseType: 'buffer' })).data, charset);
    const $ = cheerio.load(responseData);
    const $item = $(data.item.item);
    // 这里应该是可以通过参数注入一些代码的，不过应该无伤大雅
    return {
        link: data.link,
        title: getProp(data, 'title', $),
        description: getProp(data, 'description', $),
        allowEmpty: data.allowEmpty || false,
        item: $item
            .map((_, e) => {
                const $elem = (selector) => $(e).find(selector);
                return {
                    title: getProp(data, ['item', 'title'], $elem),
                    description: getProp(data, ['item', 'description'], $elem),
                    pubDate: getProp(data, ['item', 'pubDate'], $elem),
                    link: getProp(data, ['item', 'link'], $elem),
                    guid: getProp(data, ['item', 'guid'], $elem),
                };
            })
            .get(),
    };
}

module.exports = buildData;
module.exports.transElemText = transElemText;
module.exports.replaceParams = replaceParams;
module.exports.getProp = getProp;
