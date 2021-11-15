import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        id
    } = ctx.params;
    const link = `https://wolley.io/items?user=${id}`;

    const {
        data
    } = await got({
        method: 'get',
        url: link,
    });

    // 使用 cheerio 加载返回的 HTML
    const $ = cheerio.load(data);
    const list = $('div[class=item-text]');

    ctx.state.data = {
        title: `wolley @${id}`,
        link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const comments_path = item.find('.comments-link a').attr('href');

                    return {
                        title: item.find('.title a').first().text(),
                        description: `via <a href=https://wolley.io/user/${id}>@${id}</a><br><a href=https://wolley.io${comments_path}>Comments</a>`,
                        link: item.find('.title a').first().attr('href'),
                    };
                })
                .get(),
    };
};
