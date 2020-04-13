const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.mittrchina.com/';
    const listData = await got.get(url);
    const $1 = cheerio.load(listData.data);
    const list = $1('.news-item-title');

    ctx.state.data = {
        title: 'MIT科技评论',
        link: url,
        item: await Promise.all(
            list
                .slice(0, 10)
                .map(async (index, item) => {
                    item = $1(item);
                    let fullTextGet = '';
                    let fullText = '';
                    let $2 = '';
                    const href = item.find('a').attr('href');
                    const contentUrl = 'http://www.mittrchina.com' + href;
                    const description = await ctx.cache.tryGet(contentUrl, async () => {
                        fullTextGet = await got.get(contentUrl);
                        $2 = cheerio.load(fullTextGet.data);
                        fullText = $2('.content').html();
                        return fullText;
                    });
                    return {
                        title: item.find('a').text(),
                        description: description,
                        link: contentUrl,
                    };
                })
                .get()
        ),
    };
};
