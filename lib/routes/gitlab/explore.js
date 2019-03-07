const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type === 'all' ? '' : ctx.params.type;
    const typename = {
        trending: 'Trending',
        starred: 'Most stars',
        all: 'All',
    };

    const res = await axios({
        method: 'get',
        url: `https://gitlab.com/explore/projects/${type}`,
    });
    const $ = cheerio.load(res.data);
    const list = $('ul.projects-list').find('li');

    ctx.state.data = {
        title: `${typename[ctx.params.type]} - Explore - Gitlab`,
        link: `https://gitlab.com/explore/projects/${type}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.project-full-name').text(),
                        description: item.find('.description').text(),
                        link: `https://gitlab.com${item.find('a.text-plain').attr('href')}`,
                    };
                })
                .get(),
    };
};
