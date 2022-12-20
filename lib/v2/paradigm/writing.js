const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.paradigm.xyz';

module.exports = async (ctx) => {
    const url = `${baseUrl}/writing`;

    const response = await got(url);
    const $ = cheerio.load(response.data);

    const list = $('.Writing_writing__post___l5Qs')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: `${baseUrl}${$(item).find('a').attr('href')}`,
            author: $(item).find('span > a').text(),
            pubDate: parseDate(
                $(item)
                    .find('p')
                    .last()
                    .text()
                    .split(/\son\s/)
                    .at(-1)
            ),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                // Remove the TOC
                $('.Post_post__content__dmuW4').find('nav.toc').remove();
                item.description = $('.Post_post__content__dmuW4').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Paradigm - Writing',
        link: url,
        item: items,
    };
};
