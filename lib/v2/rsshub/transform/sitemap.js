const got = require('@/utils/got');
const xml2js = require('xml2js');
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
    const parser = new xml2js.Parser();
    const parsedXML = await parser.parseStringPromise(response.data);
    
    const rssTitle = routeParams.get('title') ? routeParams.get('title') : (parsedXML.urlset && parsedXML.urlset.url && parsedXML.urlset.url[0] && parsedXML.urlset.url[0].loc ? parsedXML.urlset.url[0].loc[0] : 'Sitemap');
    
    const items = parsedXML.urlset.url.map((item) => {
        try {
            let title = item.loc ? item.loc[0] : '';
            let link = item.loc ? item.loc[0] : '';
            let description = item['image:image'] && item['image:image'][0] && item['image:image'][0]['image:caption'] ? item['image:image'][0]['image:caption'][0] : '';
            let pubDate = item.lastmod ? item.lastmod[0] : undefined;

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

    ctx.state.data = {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
};
