const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.scio.gov.cn/32344/index.htm`;
    const listData = await got.get(link);
    const $ = cheerio.load(listData.data);
    const list = $('.list .mb10 .mt10 li');

    ctx.state.data = {
        title: '国务院 - 吹风会',
        link: link,
        item: await Promise.all(
            list &&
                list
                    .slice(1, 12)
                    .map(async (index, item) => {
                        item = $(item);
                        const contenlUrl = item.find('a').attr('href');
                        const description = await ctx.cache.tryGet(contenlUrl, async () => {
                            const fullText = await got.get(contenlUrl);
                            const fullTextData = cheerio.load(fullText.data);
                            return fullTextData('.textlive');
                        });
                        return {
                            title: item.find('a').text(),
                            description: description,
                            link: item.find('a').attr('href'),
                        };
                    })
                    .get()
        ),
    };
};
