const url = require('url');
const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const branch = ctx.params.branch;
    const filepath = ctx.params.filepath;

    const fileUrl = `https://github.com/${user}/${repo}/commits/${branch}/${filepath}`;

    const res = await axios({
        method: 'get',
        url: fileUrl,
        headers: {
            Referer: `https://github.com/${user}/${repo}/blob/${branch}/${filepath}`,
        },
    });
    const $ = cheerio.load(res.data);
    const list = $('.commits-listing').find('.commits-list-item');
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItems = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const commitUrl = each
                .find('a', '.sha.btn')
                .attr('href')
                .replace(/#.*$/, '');
            const createAt = each.find('relative-time').attr('datetime');
            const item = {
                title: each.find('p', '.commit-title').text(),
                description: each.find('div', '.commit-desc').html(),
                link: url.resolve('https://github.com', commitUrl),
                author: each.find('a', '.commit-author:first').text(),
                pubDate: new Date(createAt).toUTCString(),
            };
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `GitHub File - ${user}/${repo}/${branch}/${filepath}`,
        link: fileUrl,
        item: resultItems,
    };
};
