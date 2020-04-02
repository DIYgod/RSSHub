const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const base = 'https://grs.bupt.edu.cn';
const sourceTimezoneOffset = -8;

module.exports = async (ctx) => {
    let out = [];

    const fetch = async (pageIndex) => {
        const pageUrl = url.resolve(base, `/list/list.php?p=16_1_${pageIndex}`);
        const response = await got({
            method: 'get',
            url: pageUrl,
        });

        const $ = cheerio.load(response.data);
        const list = $('#news li').get();

        const result = await Promise.all(
            list.map(async (i) => {
                const item = $(i);
                const itemUrl = url.resolve(base, $(item).find('a').attr('href'));

                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const title = $(item).find('a').attr('title');
                const itemResponse = await got.get(itemUrl);
                const itemElement = cheerio.load(itemResponse.data);
                const description = itemElement('#news #article').html();

                const pageInfo = itemElement('#news #date').text();
                const regex = /\d{4}-\d{2}-\d{2}/;
                const regRes = regex.exec(pageInfo);
                const time = regRes === null ? new Date() : new Date(regRes[0]);
                time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);

                const single = {
                    title: title,
                    description: description,
                    pubDate: time.toUTCString(),
                    link: itemUrl,
                    guid: itemUrl,
                };

                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
        );
        out = out.concat(result);
    };

    await Promise.all([1, 2].map(async (value) => await fetch(value)));

    ctx.state.data = {
        title: '北京邮电大学研究生院',
        link: 'https://grs.bupt.edu.cn/list/list.php?p=16_1_1',
        item: out,
    };
};
