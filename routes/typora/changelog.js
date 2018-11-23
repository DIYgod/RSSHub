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

    const loadContent = async (link) => {
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

        return {
            title: title,
            link: link,
            guid: link,
            pubDate: pubDate,
            description: html,
        };
    };

    const items = await Promise.all(
        $('#content > ul:nth-child(2) > li')
            .get()
            .map(async (item) => {
                const node = $('a', item);
                const link = node.attr('href');
                const result = await ctx.cache.tryGet(link, async () => loadContent(link));

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
