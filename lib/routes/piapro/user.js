const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const base = 'https://piapro.jp';

module.exports = async (ctx) => {
    const pid = ctx.params.pid;

    const url = `${base}/my_page/?view=content&pid=${pid}`;

    const list_response = await got.get(url);

    const $ = cheerio.load(list_response.data);

    const user_name = $('#main_name h2').text();
    const user_description = $('#main_name p').text();

    const list = $('#itemcont .i_main')
        .map(function () {
            return base + $(this).find('a').last().attr('href');
        })
        .toArray();

    const out = await Promise.all(
        list.slice(0, 10).map(async (url) => {
            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(url);
            const item = utils.parseContent(response.data);
            item.link = url;

            ctx.cache.set(url, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `piapro - ${user_name}の投稿作品`,
        description: user_description,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
