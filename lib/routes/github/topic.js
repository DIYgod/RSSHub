import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    const link = `https://github.com/topics/${ctx.params.name}?${ctx.params.qs}`;
    const { data } = await got(link);
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: $('title').text(),
        link,
        item: $('article.my-4')
            .map((_, item) => {
                item = $(item);

                const title = $(item.find('h1 a').get(1)).attr('href').slice(1);
                const [author] = title.split('/');
                const description = item.find('div.border-bottom > div > p + div').text();
                const link = `https://github.com/${title}`;

                return { title, author, description, link };
            })
            .get(),
    };
};
