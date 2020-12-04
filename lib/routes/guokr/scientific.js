const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20&offset=0');

    const result = response.data.result;

    ctx.state.data = {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: await Promise.all(
            result.map(
                async (item) =>
                    await ctx.cache.tryGet(item.url, async () => {
                        const res = await got.get(item.url);
                        const $ = cheerio.load(res.data);
                        item.description = $('.eflYNZ #js_content').css('visibility', 'visible').html() || $('.bPfFQI').html();
                        return {
                            title: item.title,
                            description: item.description,
                            pubDate: item.date_published,
                            link: item.url,
                            author: item.author.nickname,
                        };
                    })
            )
        ),
    };
};
