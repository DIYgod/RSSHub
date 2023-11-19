const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const team = ctx.params.team ?? 'G2_Esports';

    const rootUrl = 'https://liquipedia.net';
    const currentUrl = `${rootUrl}/counterstrike/${team}/Matches`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.recent-matches-bg-lose, .recent-matches-bg-win');

    const matches = list
        .map((_, item) => {
            item = $(item);

            const getRes = () => {
                if (item.attr('class') === 'recent-matches-bg-lose') {
                    return 'LOSS';
                } else if (item.attr('class') === 'recent-matches-bg-win') {
                    return 'WIN';
                } else {
                    return 'DRAW';
                }
            };
            const result = getRes();

            const info_list = item.find('td');

            const time = info_list.eq(0).text() + ' ' + info_list.eq(1).text();
            const tournament = info_list.eq(6).text();
            const score = info_list.eq(7).text();
            const opponent = info_list.eq(8).text();

            return {
                title: `[${result}] ${team} ${score} ${opponent} on ${tournament}`,
                description: `${time},  ${team} ${score} ${opponent} on ${tournament}`,
                pubDate: new Date(time).toUTCString(),
                link: currentUrl,
            };
        })
        .get();

    ctx.state.data = {
        title: `[Counter-Strike] ${team} Match Results From Liquipedia`,
        link: currentUrl,
        item: matches,
    };
};
