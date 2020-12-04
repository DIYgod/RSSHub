const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=20&topic_id=${id}&sort=created_at&include_total=false`;
    const response = await got({
        method: 'get',
        url: api_url,
    });
    const list = response.data.list;
    let topic_title = '';
    let topic_link = '';
    let topic_des = '';
    const out = await Promise.all(
        list.map(async (item) => {
            const title = item.title;
            const date = item.created_at;
            const itemUrl = `https://sspai.com/post/${item.id}`;
            const author = item.author.nickname;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            if (topic_title === '') {
                topic_title = item.topics[0].title;
                topic_link = `https://sspai.com/topic/${id}`;
                topic_des = item.topics[0].intro;
            }
            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('#app > div.postPage.article-wrapper > div.article-detail > article > div.article-body').html();

            const single = {
                title: title,
                link: itemUrl,
                author: author,
                description: description,
                pubDate: new Date(date * 1000).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `少数派专题-${topic_title}`,
        link: topic_link,
        description: topic_des,
        item: out,
    };
};
