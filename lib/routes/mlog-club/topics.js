import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        node
    } = ctx.params;
    const url = 'https://mlog.club/topics/node/' + node;
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $('.topic-list article')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('.topic-title a');
            const $author = elem.find('.topic-meta span[itemprop="author"] a');

            return {
                title: $link.text(),
                // description: elem
                //     .find('dd')
                //     .eq(0)
                //     .text(),
                link: $link.attr('href'),
                author: $author.text(),
            };
        })
        .get();

    const title = $('title').text();

    ctx.state.data = {
        title,
        link: url,
        item: resultItem,
    };
};
