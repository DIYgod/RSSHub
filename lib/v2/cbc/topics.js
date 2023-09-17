const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.cbc.ca';
    const topic = ctx.params.topic || '';
    const url = `${baseUrl}/news${topic ? `/${topic.replace('-', '/')}` : ''}`;

    const response = await got(url);

    const data = response.data;

    const $ = cheerio.load(data);
    const links = [];

    function pushLinks(index, item) {
        const link = item.attribs.href;
        if (link.startsWith('/')) {
            links.push(baseUrl + link);
        }
    }

    $('a.contentWrapper').each(pushLinks);
    $('a.card').each(pushLinks);

    const out = await Promise.all(
        links.map((link) =>
            ctx.cache.tryGet(link, async () => {
                const result = await got(link);

                const $ = cheerio.load(result.data);

                const head = JSON.parse($('script[type="application/ld+json"]').first().text());
                if (!head) {
                    return [];
                }

                const title = head.headline;
                let author = '';
                if (head.author) {
                    author = head.author.map((author) => author.name).join(' & ');
                }
                const pubDate = head.datePublished;
                const description = $('div[data-cy=storyWrapper]').html();

                return { title, author, pubDate, description, link };
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out.filter((x) => x.title),
    };
};
