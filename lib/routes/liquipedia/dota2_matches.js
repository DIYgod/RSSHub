const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const team = ctx.params.id;
    const url = `https://liquipedia.net/dota2/${team}`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.recent-matches > table > tbody > tr[style]');

    ctx.state.data = {
        title: `Liquipedia Dota2 ${team} Matches`,
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    let message = '';
                    if (item.attr('style') === 'background:rgb(240, 255, 240)') {
                        message = '胜';
                    } else if (item.attr('style') === 'background:rgb(249, 240, 242)') {
                        message = '败';
                    } else {
                        message = '平';
                    }
                    const date = item.find('td:nth-child(1)').text();
                    const time = item.find('td:nth-child(2)').text();
                    const tournament = item.find('td:nth-child(5) > a').text();
                    const date_time = new Date(date + ' ' + time).toUTCString();
                    const score = item.find('td:nth-child(6)').text();
                    const vs_team = item.find('td:nth-child(7) > span > span.team-template-text > a').text();

                    return {
                        title: `[${message}] ${score} ${vs_team}`,
                        description: `At ${tournament},  ${team} ${score} ${vs_team}`,
                        pubDate: date_time,
                        link: url,
                        guid: url + date_time,
                    };
                })
                .get(),
    };
};
