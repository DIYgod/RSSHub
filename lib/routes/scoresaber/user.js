const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const hostname = 'https://scoresaber.com';

    const response = await got({
        method: 'get',
        url: `${hostname}/u/${id}&sort=2`,
    });

    const $ = cheerio.load(response.data);

    const username = $('.is-5 a').text();
    const list = $('tbody tr').reverse();

    const result1 = list
        .map((index, item) => {
            item = $(item);
            const song = item.find('.songTop.pp').text();
            const mapper = item.find('.songTop.mapper').text();
            const rank = item.find('.rank').text();
            const time = new Date(item.find('.time').attr('title')).toLocaleString();
            const ppValue = item.find('.ppValue').text();
            const ppWeightedValue = item.find('.ppWeightedValue').text();
            const scoreBottom = item.find('.scoreBottom').text();

            return {
                title: `【${song}】${mapper} ${time} ${rank} PP:${ppValue}${ppWeightedValue} - ${scoreBottom}`,
                description: $('.box:first-child').html(),
                link: hostname + item.find('a').attr('href') + '?search=' + username,
                pubDate: time,
                author: 'scoresaber',
            };
        })
        .get();

    ctx.state.data = {
        title: `${username}的ScoreSaber动态`,
        link: `https://scoresaber.com/u/${id}&sort=2`,
        item: result1,
    };
};
