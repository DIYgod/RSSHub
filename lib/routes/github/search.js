const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://github.com';

module.exports = async (ctx) => {
    const query = ctx.params.query;
    let sort = ctx.params.sort || 'bestmatch';
    const order = ctx.params.order || 'desc';

    if (sort === 'bestmatch') {
        sort = '';
    }

    const suffix = 'search?o='.concat(order, '&q=', encodeURIComponent(query), '&s=', sort, '&type=Repositories');
    const link = url.resolve(host, suffix);
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const out = $('.repo-list li')
        .slice(0, 10)
        .map(function () {
            const single = {
                title: $(this).find('div h3 a').text(),
                link: host.concat($(this).find('div h3 a').attr('href')),
                description: $(this).find('div p').text().trim(),
            };
            return single;
        })
        .get();

    ctx.state.data = {
        allowEmpty: true,
        title: `${query}的搜索结果`,
        link: link,
        item: out,
    };
};
