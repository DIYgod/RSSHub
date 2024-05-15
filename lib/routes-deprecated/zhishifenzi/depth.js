const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const { parseRelativeDate } = require('@/utils/parse-date');

const base = 'http://zhishifenzi.com';

module.exports = async (ctx) => {
    const link = `${base}/depth/`;
    const response = await got.get(encodeURI(link));
    const pageCapture = cheerio.load(response.data);

    const title = '深度';

    const list = pageCapture('div.inner_depth_list > ul > li').get();
    const out = await Promise.all(
        list.map(async (elem) => {
            const $ = cheerio.load(elem);
            const title = $('h5 > a').text();
            const partial = $('h5 > a').attr('href');
            const address = url.resolve(base, partial);
            const pubDate = parseRelativeDate($('div.inner_depth_list_tags > p').first().text());

            // const keywords = $('div.inner_depth_list_tags > p')
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

                item.description = detailCapture('.main div.inner_content').html().replaceAll('src="/', `src="${base}/`);
                ctx.cache.set(address, item.description);
            }

            return item;
        })
    );

    ctx.state.data = {
        title: `知識分子 | ${title}`,
        description: `知識分子 | 科學 文明 智慧`,
        link,
        item: out,
    };
};
