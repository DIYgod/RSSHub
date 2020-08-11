const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.cbc.ca';
    const topic = ctx.params.topic || '';
    const url = `${baseUrl}/news/${topic.replace('-', '/')}`;

    const response = await got({
        method: 'get',
        url: url,
    });

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
        links.map(async (link) => {
            const [title, author, pubDate, description] = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);

                const $ = cheerio.load(result.data);

                const head = JSON.parse($('script[type="application/ld+json"]').html());
                if (!head) {
                    return [];
                }

                const title = head.headline;
                let author = '';
                if (head.author) {
                    author = head.author.map((author) => author.name).join(' & ');
                }
                const pubDate = head.datePublished;
                const description = $('div.storyWrapper').html();

                return [title, author, pubDate, description];
            });

            if (!title) {
                return Promise.resolve(undefined);
            }

            const item = {
                title: title,
                description: description,
                pubDate: pubDate,
                link: link,
                author: author,
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out.filter((x) => x),
    };
};
