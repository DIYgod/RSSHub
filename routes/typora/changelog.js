const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://support.typora.io/';

    const response = await axios({
        method: 'get',
        url: host,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);

    const parseContent = async (link) => {
        // Check cache
        const cache = await ctx.cache.get(link);
        if (cache) {
            return Promise.resolve(JSON.parse(cache));
        }

        const response = await axios({
            method: 'get',
            url: link,
            headers: {
                Referer: host,
            },
        });

        const $ = cheerio.load(response.data);

        const title = $('h1').text();
        const pubDate = new Date($('.post-meta time').text());
        // const author = $('.post-meta span').text();
        const html = $('#pagecontainer').html();

        const result = {
            title: title,
            link: link,
            guid: link,
            pubDate: pubDate,
            description: html,
        };

        ctx.cache.set(link, JSON.stringify(result), 3 * 60 * 60);

        return result;
    };

    const items = await Promise.all(
        $('#content > ul:nth-child(2) > li')
            .get()
            .map(async (item) => {
                const node = $('a', item);
                const link = node.attr('href');
                const result = await parseContent(link);

                return Promise.resolve(result);
            })
    );

    ctx.state.data = {
        title: 'Typora Changelog',
        link: host,
        description: 'Typora Changelog',
        item: items,
    };
};
