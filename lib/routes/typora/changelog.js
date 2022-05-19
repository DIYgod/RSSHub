const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://support.typora.io/';

    const response = await got({
        method: 'get',
        url: host,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);

    const loadContent = async (link) => {
        const response = await got({
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
            title,
            link,
            guid: link,
            pubDate,
            description: html,
        };
    };

    const items = await Promise.all(
        $('#list-contents > ul:nth-child(2) > li')
            .get()
            .map(async (item) => {
                const node = $('a', item);
                const link = node.attr('href');
                const result = await ctx.cache.tryGet(link, () => loadContent(link));

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
