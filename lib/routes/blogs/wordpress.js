const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const scheme = ctx.params.https || 'https';
    const cdnList = ['https://imageproxy.pimg.tw/resize?url=', 'https://images.weserv.nl/?url=', 'https://pic1.xuehuaimg.com/proxy/', 'https://cors.netnr.workers.dev/'];
    const cdn = cdnList[ctx.params.cdn] || ctx.params.cdn;

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
                    : item['content:encoded'].replace(/(?<=<img.*src=")(.*)(?=".*\/>)/g, function (match, p) {
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
                description: description,
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
