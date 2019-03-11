const cheerio = require('cheerio');
const axios = require('./axios');

function transElemText($, prop) {
    const regex = new RegExp(/\$\((.*)\)/g);
    let result = prop;
    if (regex.test(result)) {
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
    const response = (await axios.get(data.url)).data;
    const $ = cheerio.load(response);
    const $item = $(data.item.item);
    // 这里应该是可以通过参数注入一些代码的，不过应该无伤大雅
    return {
        title: getProp(data, 'title', $),
        description: getProp(data, 'description', $),
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
