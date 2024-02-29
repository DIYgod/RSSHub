const parser = require('@/utils/rss-parser');
const config = require('@/config').value;
const allowDomain = new Set(['lawrence.code.blog']);

module.exports = async (ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(ctx.params.domain)) {
        ctx.throw(403, `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const scheme = ctx.params.https || 'https';
    const cdn = config.wordpress.cdnUrl;

    const domain = `${scheme}://${ctx.params.domain}`;
    const feed = await parser.parseURL(`${domain}/feed/`);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }
            const description =
                scheme === 'https' || !cdn
                    ? item['content:encoded']
                    : item['content:encoded'].replaceAll(/(?<=<img.*src=")(.*)(?=".*\/>)/g, (match, p) => {
                          if (p[0] === '/') {
                              return cdn + feed.link + p;
                          } else if (p.slice(0, 5) === 'http:') {
                              return cdn + p;
                          } else {
                              return p;
                          }
                      });
            const article = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
                author: item.creator,
            };
            return article;
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
