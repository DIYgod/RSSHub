import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const baseUrl = 'https://www.cbc.ca';
    const {
        topic = ''
    } = ctx.params;
    const url = `${baseUrl}/news/${topic.replace('-', '/')}`;

    const {
        data
    } = await got({
        method: 'get',
        url,
    });

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
                return undefined;
            }

            return {
                title,
                description,
                pubDate,
                link,
                author,
            };
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out.filter(Boolean),
    };
};
