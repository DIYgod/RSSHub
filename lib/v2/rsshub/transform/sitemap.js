const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

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
    const $ = cheerio.load(response.data, { xmlMode: true });

    const rssTitle = routeParams.get('title') ? routeParams.get('title') : (parsedXML.urlset && parsedXML.urlset.url && parsedXML.urlset.url[0] && parsedXML.urlset.url[0].loc ? parsedXML.urlset.url[0].loc[0] : 'Sitemap');

    let items;
    const urls = $('urlset url');
    if (urls && urls.length) {
        items = parsedXML.urlset.url.map((item) => {
            try {
                const title = $(item).find('loc').text() || '';
                const link = $(item).find('loc').text() || '';
                const description = $(item).find('image\\:image image\\:caption').text() || '';
                const pubDate = $(item).find('lastmod').text() || undefined;

                return {
                    title,
                    link,
                    description,
                    pubDate,
                };
            } catch (e) {
                return null;
            }
        })
        .filter(Boolean);
    }
    else {
        items = [];
    }

    ctx.state.data = {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
