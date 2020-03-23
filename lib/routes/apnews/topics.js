const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;

    const response = await got({
        method: 'get',
        url: `https://www.apnews.com/${topic}`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    // const list = $('div.FeedCard');
    const list = [];
    $('div.FeedCard').each(function(index, item) {
        if (
            $(item)
                .find('a[class^=Component-headline]')
                .attr('href') !== undefined
        ) {
            list.push(item);
        }
    });

    const out = await Promise.all(
        list.map(async (article) => {
            const link = url.resolve(
                'https://apnews.com',
                $(article)
                    .find('a[class^=Component-headline]')
                    .attr('href')
            );

            const [title, author, pubDate, description] = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);

                const $ = cheerio.load(result.data);

                const head = JSON.parse($('script[type="application/ld+json"]').html());

                const title = head.headline;
                const author = head.author.join(' & ');
                const pubDate = head.datePublished;

                const text = $('div.Article').html();
                const imageUrl = head.image;
                const description = `<img src="${imageUrl}">` + text;

                return [title, author, pubDate, description];
            });

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
        title: 'AP News - ' + $('title').text(),
        link: `https://www.apnews.com/${topic}`,
        item: out,
    };
};
