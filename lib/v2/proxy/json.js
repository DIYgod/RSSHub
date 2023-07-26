const got = require('@/utils/got');
const cheerio = require('cheerio');

function jsonGet(obj, attr) {
    if (typeof attr !== 'string') {
        return obj;
    }
    // a.b.c
    // a.b[0].c => a.b.0.c
    attr.split('.').forEach((key) => {
        obj = obj[key];
    });
    return obj;
}

module.exports = async (ctx) => {
    const { url } = ctx.params;
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.params.routeParams);
    let rsstitle = routeParams.get('title');
    if (!rsstitle) {
        const resp = await got({
            method: 'get',
            url: new URL(url).origin,
        });
        const $ = cheerio.load(resp.data);
        rsstitle = $('title').text();
    }

    const items = jsonGet(response.data, routeParams.get('item')).map((item) => ({
        title: jsonGet(item, routeParams.get('itemTitle')),
        link: jsonGet(item, routeParams.get('itemLink')),
    }));

    ctx.state.data = {
        title: rsstitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
