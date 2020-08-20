const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const person = ctx.params.person;
    const uid = ctx.params.uid;
    const response = await got({
        method: 'get',
        url: `https://getquicker.net/User/${uid}/${person}`,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.align-middle:nth-child(2) a:nth-child(1)');

    const out = list
        .map((index, item) => {
            item = $(item);
            return {
                title: item.text(),
                description: item.next().text(),
                guid: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: '用户动作 - Quicker',
        link: 'https://getquicker.net/Help/Versions',
        item: out,
    };
};
