const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const magazine = ctx.params.magazine;
    const path = `paper/${type}/${magazine}`;
    const response = await got(path, {
        method: 'GET',
        prefixUrl: utils.host,
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

                const picId = news.find('.magazine-pic').attr('id');
                const noPic = utils.host + '/css/images/nothesispic.jpg';
                let imageUrl = noPic;
                if (picId) {
                    const imageId = picId.substring(9);
                    const getLink = utils.host + '/attachment/getPaperImgUrl';
                    imageUrl =
                        (await ctx.cache.tryGet(getLink + imageId, async () => {
                            const result = await got.get(getLink, {
                                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                                searchParams: queryString.stringify({
                                    attachmentId: imageId,
                                }),
                            });
                            return result.data;
                        })) || noPic;
                }
                const image = imageUrl;
                const text = $(element).find('.magazine-description').text();
                const description = utils.setDesc(image, text);

                const span = news.find('.magazine-text-atten');
                const arr = span.map((index, element) => $(element).text()).get();
                const author = arr[1];
                const date = utils.getDate(arr[0]);
                const pubDate = utils.transDate(date);

                const single = {
                    title,
                    link,
                    description,
                    author,
                    pubDate,
                };
                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title,
        link: response.url,
        description,
        item,
    };
};
