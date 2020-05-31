const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.ccreports.com.cn/';
    const listData = await got.get(url);
    const $1 = cheerio.load(listData.data);
    const list = $1('.con h2');

    ctx.state.data = {
        title: '消费者报道',
        link: url,
        item: await Promise.all(
            list
                .slice(0, 5)
                .map(async (index, item) => {
                    item = $1(item);
                    let fullTextGet = '';
                    let fullText = '';
                    let $2 = '';
                    const contentUrl = item.find('a').attr('href');
                    const description = await ctx.cache.tryGet(contentUrl, async () => {
                        fullTextGet = await got.get(contentUrl);
                        $2 = cheerio.load(fullTextGet.data);
                        $2('.h1p').remove();
                        $2('.prenext').remove();
                        $2('.pinglun').remove();
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
