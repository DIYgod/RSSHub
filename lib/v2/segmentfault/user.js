const got = require('@/utils/got');
const { host, acw_sc__v2, parseList, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const apiURL = `${host}/gateway/homepage/${name}/timeline?size=20&offset=`;

    const response = await got(apiURL);
    const data = response.data.rows;

    const list = parseList(data);
    const { author } = list[0];

    const acwScV2Cookie = await acw_sc__v2(list[0].link, ctx.cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `segmentfault - ${author}`,
        link: `${host}/u/${name}`,
        item: items,
    };
};
