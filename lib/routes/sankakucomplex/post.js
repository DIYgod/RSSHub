const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://idol.sankakucomplex.com/post/atom',
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: 'Posts | Idol Complex - Idol & Cosplay Images',
        link: 'https://idol.sankakucomplex.com/',
        item: $('entry')
            .map((index, item) => {
                item = $(item);

                const title = item.find('title').text();
                const link = `https:${item.find('link').attr('href')}`;
                const pubDate = new Date(item.find('updated').text()).toUTCString();
                const author = item.find('author name').text();
                const summary = item.find('summary').text();
                const id = 'x-rss';
                const $2 = cheerio.load(`<div id="${id}">${item.find('content').html()}</div>`);

                $2('a').each((index, item) => {
                    item = $2(item);
                    item.attr('href', `https:${item.attr('href')}`);
                });
                $2('img').each((index, item) => {
                    item = $2(item);
                    item.attr('src', `https:${item.attr('src')}`);
                    item.attr('referrerpolicy', 'no-referrer');
                });

                const content = $2(`#${id}`).html();
                const description = `${summary}<br>${content}`;

                return {
                    title,
                    link,
                    pubDate,
                    author,
                    description,
                };
            })
            .get(),
    };
};
