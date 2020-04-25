const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const date = require('@/utils/date');

const base = 'http://zhishifenzi.com';

module.exports = async (ctx) => {
    let link = `${base}/innovation`;

    const type = ctx.params.type;
    // type can be on of:
    // ["multiple", "company", "product", "technology", "character", "policy"]
    if (typeof type !== 'undefined') {
        link = `${link}/${type}`;
    }
    const response = await got.get(encodeURI(link));
    const pageCapture = cheerio.load(response.data);

    let title = pageCapture('div.innovation_nav > ul > li.sel').text().split('：').pop();
    if (title === '') {
        title = '全部創新';
    } else {
        title = `創新「${title}」`;
    }
    const list = pageCapture('div.inner_news_list > ul > li.clearfix').get();
    const out = await Promise.all(
        list.slice(0, 4).map(async (elem) => {
            const $ = cheerio.load(elem);
            const title = $('div > h5 > a').text();
            const partial = $('div > h5 > a').attr('href');
            const address = url.resolve(base, partial);
            const pubDate = date($('span').first().text());

            // const keywords = $('span')
            // .last()
            // .html();
            const item = {
                title,
                pubDate,
                link: encodeURI(address),
            };

            const value = await ctx.cache.get(address);
            if (value) {
                item.description = value;
            } else {
                const detail = await got.get(item.link);
                const detailCapture = cheerio.load(detail.data);

                item.description = detailCapture('.main div.inner_content')
                    .html()
                    .replace(/src="\//g, `src="${base}/`);
                ctx.cache.set(address, item.description);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `知識分子 | ${title}`,
        description: `知識分子 | 科學 文明 智慧`,
        link: link,
        item: out,
    };
};
