const axios = require('@/utils/axios');
const cheerio = require('cheerio');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.gcores.com/categories/${category}/originals`;
    const res = await axios({
        method: 'get',
        url: url,
    });
    const data = res.data;
    let $ = cheerio.load(data);
    const list = $('.row .showcase');
    const count = [];
    const feedTitle = $('title')
        .text()
        .split('_')[0];

    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const item = list[i];
            const itemUrl = $(item)
                .find('h4 a')
                .attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const title = $(item)
                .find('h4 a')
                .text();
            let itemRes;
            try {
                itemRes = await axios({
                    method: 'get',
                    url: itemUrl,
                });
            } catch (e) {
                return Promise.resolve();
            }
            const itemPage = itemRes.data;
            $ = cheerio.load(itemPage);

            $('img').each((index, elem) => {
                const $elem = $(elem);
                const src = $elem.attr('data-original');
                if (src) {
                    $elem.attr('src', src);
                    $elem.removeAttr('data-original');
                }
            });

            const content = $('.story').html();
            const pageInfo = $('.story_info').text();
            let regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
            let regRes = regex.exec(pageInfo);
            if (!regRes) {
                regex = /\d{4}-\d{2}-\d{2}/;
                regRes = regex.exec(pageInfo);
            }
            const time = regRes === null ? new Date() : new Date(regRes[0]);
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);
            const single = {
                title: title,
                description: content,
                pubDate: time.toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: feedTitle,
        link: url,
        item: out,
    };
};
