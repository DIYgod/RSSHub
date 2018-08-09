const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

const _axios_client = axios.create({
    headers: {
        'User-Agent': config.ua,
    },
});

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/${user}/${repo}/issues`;

    const response = await _axios_client.get(host);

    const $ = cheerio.load(response.data);
    const list = $('.h4.js-navigation-open');

    const out = [];
    const proList = [];

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i]);
        const title = $(list[i]).text();
        const itemUrl = `https://github.com${$(list[i]).attr('href')}`;
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
        }
        const single = {
            title,
            guid: itemUrl,
            url: itemUrl,
        };
        try {
            const es = axios.get(itemUrl);
            proList.push(es);
            out.push(single);
        } catch (err) {
            console.log(`${title}: ${itemUrl} -- ${err.response.status}: ${err.response.statusText}`);
        }
    }

    const responses = await axios.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const $ = cheerio.load(responses[i].data);
        const full = $('div.js-discussion');

        out[i].description = full.find('td.comment-body:first-of-type').html();
        out[i].author = $('div.TableObject-item--primary a.author').text();

        const date = $('div.TableObject-item--primary relative-time');
        out[i].pubDate = new Date($(date).attr('datetime'));
        ctx.cache.set(out[i].link, JSON.stringify(out[i]), 24 * 60 * 60);
    }

    ctx.state.data = {
        title: `GitHub Issues for ${user}/${repo}`,
        link: host,
        item: out,
    };
};
