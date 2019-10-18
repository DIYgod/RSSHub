const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const magazine = ctx.params.magazine;
    const path = `/paper/${type}/${magazine}`;
    const response = await got(path, {
        method: 'GET',
        baseUrl: utils.host,
        headers: {
            Cookie: 'closeFloatWindow=true; journalIndexViewType=list; journalSort=publishDate',
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const newsitem = $('.magazine-text');

    const item = await Promise.all(
        newsitem
            .map(async (index, element) => {
                const news = $(element);

                const a = news.find('.magazine-text-title').find('a');
                const title = a.text();
                const link = utils.host + a.attr('href');

                const imageId = news
                    .find('.magazine-pic')
                    .attr('id')
                    .substring(9);
                const getLink = utils.host + '/attachment/getImgUrl';
                const noPic = utils.host + '/css/images/nothesispic.jpg';
                const imageUrl = await ctx.cache.tryGet(getLink, async () => {
                    const result = await got.get(getLink, {
                        params: {
                            attachmentId: imageId,
                        },
                    });
                    return result.data;
                });
                const image = imageUrl || noPic;
                const text = $(element)
                    .find('.magazine-description')
                    .text();
                const description = utils.setDesc(image, text);

                const span = news.find('.magazine-text-atten');
                const arr = span.map((index, element) => $(element).text()).get();
                const author = arr[1];
                const date = utils.getDate(arr[0]);
                const pubDate = utils.transDate(date);

                const single = {
                    title: title,
                    link: link,
                    description: description,
                    author: author,
                    pubDate: pubDate,
                };
                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title: title,
        link: response.url,
        description: description,
        item: item,
    };
};
