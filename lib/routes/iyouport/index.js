const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.iyouport.org/';
    const listData = await got.get(url);
    const $1 = cheerio.load(listData.data);
    const list = $1('.entry-title');

    ctx.state.data = {
        title: 'iYouPort',
        link: url,
        item: await Promise.all(
            list
                .slice(0, 10)
                .map(async (index, item) => {
                    item = $1(item);
                    let fullTextGet = '';
                    let fullText = '';
                    let $2 = '';
                    const contentUrl = item.find('a').attr('href');
                    const description = await ctx.cache.tryGet(contentUrl, async () => {
                        fullTextGet = await got.get(contentUrl);
                        $2 = cheerio.load(fullTextGet.data);
                        $2('iframe').remove();
                        $2('.wpcnt').remove();
                        $2('.sharedaddy.sd-sharing-enabled').remove();
                        $2('.sharedaddy.sd-block.sd-like.jetpack-likes-widget-wrapper.jetpack-likes-widget-unloaded').remove();
                        $2('.jp-relatedposts').remove();
                        // $2('img').removeAttr('data-lazy-srcset');
                        // $2('img').removeAttr('srcset');
                        fullText = $2('.entry-content').html();
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
