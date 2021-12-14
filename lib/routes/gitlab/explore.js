const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let { type, host } = ctx.params;
    type = type === 'all' ? '' : type;
    host = host ? host : 'gitlab.com';
    const typename = {
        trending: 'Trending',
        starred: 'Most stars',
        all: 'All',
    };

    const res = await got({
        method: 'get',
        url: `https://${host}/explore/projects/${type}`,
    });
    const $ = cheerio.load(res.data);
    const list = $('ul.projects-list').find('li');

    ctx.state.data = {
        title: `${typename[ctx.params.type]} - Explore - Gitlab`,
        link: `https://${host}/explore/projects/${type}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.project-full-name').text(),
                        author: item.find('.namespace-name').text().slice(0, -1).split('\n').join('').trim(),
                        description: item.find('.description').text(),
                        link: `https://${host}${item.find('a.text-plain').attr('href')}`,
                    };
                })
                .get(),
    };
};
