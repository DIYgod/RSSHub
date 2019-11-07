const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.jiemian.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.news-view').get();

    const proList = [];
    const indexList = [];
    // const out = [];
    //
    // for (const item of list) {
    //     const i = 0;
    //     const $ = cheerio.load(item);
    //     const time = $('.date').text();
    //     let title = $('.news-img a').attr('title');
    //     if (!title) {
    //         title = $('a').text();
    //     }
    //     const itemUrl = $('.news-img a').attr('href');
    //     const cache = await ctx.cache.get(itemUrl);
    //     if (cache) {
    //         return Promise.resolve(JSON.parse(cache));
    //     }
    //     const single = {
    //         title,
    //         pubDate: new Date(time).toUTCString(),
    //         link: itemUrl,
    //         guid: itemUrl,
    //     };
    //     if (itemUrl) {
    //         const other = await ctx.cache.tryGet(itemUrl, async () => await load(itemUrl));
    //         out.push(Object.assign({}, single, other));
    //     }
    // }

    // 加载文章页
    async function load(link) {
        const response = await got.get(link);
        const $ = cheerio.load(response.data);

        let time = $('.article-info span')
            .eq(1)
            .text();
        if (!time) {
            time = $('.article-header .info .date').text();
        }
        const pubDate = new Date(time).toUTCString();

        const content = $('.article-view .article-main').html();
        const description = content;
        return { description, pubDate };
    }

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.date').text();
            let title = $('.news-img a').attr('title');
            if (!title) {
                title = $('a').text();
            }
            const itemUrl = $('.news-img a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            if (itemUrl) {
                const other = await ctx.cache.tryGet(itemUrl, async () => await load(itemUrl));
                return Promise.resolve(Object.assign({}, single, other));
            }
            return Promise.resolve(single);
        })
    );

    // const responses = await got.all(proList);
    // for (let i = 0; i < responses.length; i++) {
    //     const res = responses[i];
    //     const $ = cheerio.load(res.data);
    //
    //     let time = $('.article-info span')
    //         .eq(1)
    //         .text();
    //     if (!time) {
    //         time = $('.article-header .info .date').text();
    //     }
    //     out[indexList[i]].pubDate = new Date(time).toUTCString();
    //
    //     const content = $('.article-view .article-main').html();
    //     out[indexList[i]].description = content;
    //     ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    // }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
