const utils = require('./utils');

const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const files = utils.listSpecTypeFiles('./configs', 'js');

module.exports = async (ctx) => {
    const { params, request } = ctx;
    const { config } = params;
    const { query } = request;
    if (config && files.includes(`${config}.js`)) {
        const data = require(`./configs/${config}.js`)(query);
        const response = (await axios.get(data.url)).data;
        const $ = cheerio.load(response);
        const $item = $(data.item.item);
        ctx.state.data = {
            title: utils.getProp(data, 'title', $),
            description: utils.getProp(data, 'description', $),
            item: $item
                .map((_, e) => {
                    const $elem = (selector) => $(e).find(selector);
                    return {
                        title: utils.getProp(data, ['item', 'title'], $elem),
                        description: utils.getProp(data, ['item', 'description'], $elem),
                        pubDate: utils.getProp(data, ['item', 'pubDate'], $elem),
                        link: utils.getProp(data, ['item', 'link'], $elem),
                        guid: utils.getProp(data, ['item', 'guid'], $elem),
                    };
                })
                .get(),
        };
    }
};
