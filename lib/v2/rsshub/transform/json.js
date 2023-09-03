const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

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
    if (!config.feature.allow_user_supply_unsafe_domain) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const { url } = ctx.params;
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.params.routeParams);
    let rssTitle = routeParams.get('title');
    if (!rssTitle) {
        const resp = await got({
            method: 'get',
            url: new URL(url).origin,
        });
        const $ = cheerio.load(resp.data);
        rssTitle = $('title').text();
    }

    const items = jsonGet(response.data, routeParams.get('item')).map((item) => {
        let link = jsonGet(item, routeParams.get('itemLink')).trim();
        // 补全绝对链接
        if (link && !link.startsWith('http')) {
            link = `${new URL(url).origin}${link}`;
        }
        return {
            title: jsonGet(item, routeParams.get('itemTitle')),
            link,
            description: routeParams.get('itemDesc') ? jsonGet(item, routeParams.get('itemDesc')) : '',
            pubDate: routeParams.get('itemPubDate') ? jsonGet(item, routeParams.get('itemPubDate')) : '',
        };
    });

    ctx.state.data = {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
