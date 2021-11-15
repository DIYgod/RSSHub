import got from '~/utils/got.js';
import cheerio from 'cheerio';
import parser from '~/utils/rss-parser';

export default async (ctx) => {
    const feed = await parser.parseURL('https://rss.cnbeta.com/');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        // 移除6.18广告
        $('.article-global').remove();
        $('.article-topic').remove();

        // 提取内容
        return $('.article-summary p').html() + '<br>' + $('.article-content').html();
    };

    const items = await Promise.all(
        feed.items
            .filter((item) => item.author !== 'adam')
            .map(async (item) => {
                const cache = await ctx.cache.get(item.link);
                if (cache) {
                    return JSON.parse(cache);
                }

                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const description = ProcessFeed(response.data);

                const single = {
                    title: item.title,
                    description,
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item.author,
                };
                ctx.cache.set(item.link, JSON.stringify(single));
                return single;
            })
    );

    ctx.state.data = {
        title: 'cnBeta',
        link: 'https://www.cnbeta.com/',
        description: feed.description,
        item: items,
    };
};
