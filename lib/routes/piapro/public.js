const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const base = 'https://piapro.jp';

const selectors = {
    music: '.snd_list li .title',
    illust: '#itemcont .i_main',
    text: '.txt_list li .title',
};

module.exports = async (ctx) => {
    const type = selectors[ctx.params.type] ? ctx.params.type : 'music';
    const tag = ctx.params.tag ? ctx.params.tag : '';
    const category = ctx.params.category ? ctx.params.category : '';

    const url = `${base}/${type}/?tag=${encodeURIComponent(tag)}&categoryId=${category}`;

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const type_name = $('#top_titlebox img').first().attr('alt');
    const category_name = $('#_filterbox_category .name').text();
    const tag_name = $('#_filterbox_character .name').text();

    const list = $(selectors[type])
        .map(function () {
            return base + $(this).find('a').first().attr('href');
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
        title: `piapro - ${type_name}${tag ? ' - ' + tag_name : ''}${category ? ' - ' + category_name : ''}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
