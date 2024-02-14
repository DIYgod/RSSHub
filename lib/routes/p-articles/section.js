const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const utils = require('./utils');

const host = 'https://p-articles.com/';

module.exports = async (ctx) => {
    let section_name = ctx.params.section;
    section_name = section_name.replace('-', '/');
    section_name += '/';

    const link = url.resolve(host, section_name);

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const top_info = {
        title: $('div.inner_top_title_01 > h1 > a').text(),
        link: url.resolve(host, $('div.inner_top_title_01 > h1 > a').attr('href')),
    };

    const list = $('div.contect_box_04 > a')
        .map(function () {
            const info = {
                title: $(this).find('h1').text().trim(),
                link: url.resolve(host, $(this).attr('href')),
            };
            return info;
        })
        .get();

    list.unshift(top_info);

    const out = await Promise.all(
        list.map(async (info) => {
            const link = info.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }
            const response = await got.get(link);

            return utils.ProcessFeed(ctx, info, response.data);
        })
    );
    ctx.state.data = {
        title: `虛詞版块-${section_name}`,
        link,
        item: out,
    };
};
