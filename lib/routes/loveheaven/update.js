const got = require('@/utils/got');
const cheerio = require('cheerio');
const chrono = require('chrono-node');

const base = 'https://loveheaven.net/';

module.exports = async (ctx) => {
    const slug = ctx.params.slug;

    const url = `https://loveheaven.net/manga-${slug.replace(/^manga-/, '').replace(/\.html$/, '')}.html`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const manga_name = $('.manga-info > h1').text();
    const manga_other_names = $('.manga-info > li:nth-child(3)').text();
    const manga_author = $('a.btn-info')
        .map(function() {
            return $(this).text();
        })
        .get()
        .join(', ');
    const manga_cover = $('img.thumbnail').attr('src');

    const list = $('.tab-text .table > tbody > tr').get();

    ctx.state.data = {
        title: `${manga_name} - LoveHeaven`,
        description: manga_other_names,
        link: url,
        image: manga_cover,
        item: list.slice(0, 20).map((item) => {
            item = $(item);
            const entry = item.find('a');
            const humanized_date = item.find('time').text();
            return {
                title: entry.text(),
                author: manga_author,
                description: `<img src="${manga_cover}" style="max-width: 100%;">`,
                link: base + entry.attr('href'),
                pubDate: humanized_date ? chrono.parseDate(humanized_date) : new Date(),
            };
        }),
    };
};
