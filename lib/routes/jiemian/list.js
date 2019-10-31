const cheerio = require('cheerio');
const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const url = `https://www.jiemian.com/lists/${ctx.params.cid}.html`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    let type, list;

    const className = $('#load-list')[0].attribs.class;

    if (className) {
        switch (className) {
            case 'list-view':
                type = 'list';
                list = $('.item-news')
                    .slice(0, 10)
                    .get();
                break;
            case 'list-view card':
                type = 'card';
                list = $('.news-view')
                    .slice(0, 10)
                    .get();
                break;

            default:
                break;
        }
    }

    const proList = [];

    let out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            let title, itemUrl;

            switch (type) {
                case 'list':
                    title = $('.item-main a').text();

                    itemUrl = $('.item-main a').attr('href');
                    break;
                case 'card':
                    title = $('.news-img a').attr('title');
                    if (!title) {
                        title = $('a').text();
                    }
                    itemUrl = $('.news-img a').attr('href');
                    break;

                default:
                    break;
            }

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(got.get(itemUrl));
            return Promise.resolve(single);
        })
    );
    const responses = await got.all(proList);

    out = util.ProcessFeed(out, responses);

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
