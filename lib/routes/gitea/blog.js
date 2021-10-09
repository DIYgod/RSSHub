const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://blog.gitea.io/';

    const response = await got({
        method: 'get',
        url: host,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);

    const loadContent = async (link) => {
        // Check cache
        const cache = await ctx.cache.get(link);
        if (cache) {
            return Promise.resolve(cache);
        }

        const response = await got({
            method: 'get',
            url: link,
            headers: {
                Referer: host,
            },
        });

        const $ = cheerio.load(response.data);
        $('section .content script').remove();
        $('section .content #discourse-comments').remove();
        const html = $('section .content').html();
        ctx.cache.set(link, html);

        return html;
    };

    const items = await Promise.all(
        $('.card .card-content')
            .get()
            .map(async (item) => {
                const title = $('.media .media-content .title', item).text();
                const subtitle = $('.media .media-content .subtitle', item).text().replace(/\t/g, '').replace(/\n/g, ' ').trim();
                const matchs = /(.*) by (.*)/.exec(subtitle);
                const pubDate = matchs && matchs.length === 3 ? new Date(matchs[1]) : new Date();
                const author = matchs && matchs.length === 3 ? matchs[2] : '';
                const link = $(item).children('a').attr('href');
                const desc = await loadContent(link);

                const single = {
                    title,
                    link,
                    guid: link,
                    pubDate: pubDate.toUTCString(),
                    description: `<p>${author}</p>${desc}`,
                };
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: 'Gitea Blog',
        link: host,
        description: 'Gitea Blog',
        item: items,
    };
};
