import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        authorid
    } = ctx.params;
    const response = await got.get(`https://webapi.8btc.com/bbt_api/comments/list?author_id=${authorid}&fetch_num=20`);

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        // 提取内容
        return $('.bbt-html').html();
    };

    const items = await Promise.all(
        response.data.data.list.map(async (item) => {
            const link = `https://www.8btc.com/article/${item.post_id}`;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.post.title,
                description,
                pubDate: item.date_gmt,
                link,
                author: item.reviewer.name,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: '巴比特作者专栏',
        link: `https://www.8btc.com/author/${authorid}`,
        description: '巴比特作者专栏',
        item: items,
    };
};
