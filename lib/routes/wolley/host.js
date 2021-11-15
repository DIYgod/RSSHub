import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        host
    } = ctx.params;
    const link = `https://wolley.io/items?host=${host}`;

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
        title: `wolley #${host}`,
        link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const comments_path = item.find('.comments-link a').attr('href');
                    const user_name = item.find('.by a').first().text().trim();

                    return {
                        title: item.find('.title a').first().text(),
                        description: `via <a href=https://wolley.io/user/${user_name}>@${user_name}</a><br><a href=https://wolley.io${comments_path}>Comments</a>`,
                        link: item.find('.title a').first().attr('href'),
                    };
                })
                .get(),
    };
};
