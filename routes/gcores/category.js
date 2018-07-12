const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.g-cores.com/categories/${category}/originals`;
    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.row .showcase');
    const out = [];

    for (let i = 0; i < Math.min(list.length, 10); i++) {
        let $ = cheerio.load(data);
        const item = list[i];
        const itemUrl = $(item)
            .find('h4 a')
            .attr('href');
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
        }
        const title = $(item)
            .find('h4 a')
            .text();
        let itemRes;
        try {
            itemRes = await axios({
                method: 'get',
                url: itemUrl,
                headers: {
                    'User-Agent': config.ua,
                },
            });
        } catch (e) {
            continue;
        }
        const itemPage = itemRes.data;
        $ = cheerio.load(itemPage);
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
        out.push(single);

        ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
    }
    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        item: out,
    };
};
