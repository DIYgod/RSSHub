const parser = require('@/utils/rss-parser');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const scheme = ctx.params.https || 'https';
    const cdn = config.wordpress.cdnUrl;

    const domain = `${scheme}://${ctx.params.domain}`;
    const feed = await parser.parseURL(`${domain}/feed/`);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const description =
                scheme === 'https' || !cdn
                    ? item['content:encoded']
                    : item['content:encoded'].replace(/(?<=<img.*src=")(.*)(?=".*\/>)/g, (match, p) => {
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
            return Promise.resolve(article);
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
