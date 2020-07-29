const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.gcores.com/${category}`;
    const res = await got({
        method: 'get',
        url: url,
    });
    const data = res.data;
    let $ = cheerio.load(data);
    const list = $('.original.am_card.original-normal');
    const count = [];
    const feedTitle = $('title').text();

    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const item = list[i];
            let itemUrl = $(item).find('a.am_card_content.original_content').attr('href');
            itemUrl = 'https://www.gcores.com' + itemUrl;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const title = $(item).find('h3.am_card_title').text();
            let itemRes;
            try {
                itemRes = await got({
                    method: 'get',
                    url: itemUrl,
                });
            } catch (e) {
                return Promise.resolve();
            }
            const itemPage = itemRes.data;
            $ = cheerio.load(itemPage);

            const cover = $('img.newsPage_cover');
            const content = $('.story.story-show').html();
            const single = {
                title: title,
                description: cover + content,
                link: itemUrl,
                guid: itemUrl,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: feedTitle,
        link: url,
        item: out,
    };
};
