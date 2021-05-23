const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const team = ctx.params.team;
    const link = `https://www.dongqiudi.com/team/${team}.html`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const teamName = $('h1.name').text();
    const list = $('table.schedule_list tr.stat_list');
    const out = [];

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i]);

        const score = $('td:nth-of-type(5)').text().trim();

        if (score !== '-') {
            const time = $('td.match_time_hidden').text();
            const type = $('td.gameweek').text();
            const home = $('td:nth-of-type(4)').text().trim();
            const away = $('td:nth-of-type(6)').text().trim();
            const title = `${type} ${home} ${score} ${away}`;

            const single = {
                title,
                link,
                pubDate: new Date(time),
                guid: title,
            };
            out.push(single);
        }
    }

    ctx.state.data = {
        title: `${teamName} 比赛结果`,
        link,
        item: out.slice(out.length - 10, out.length),
    };
};
