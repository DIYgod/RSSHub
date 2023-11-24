const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const team = ctx.params.team;

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
                } else {
                    return 'WIN';
                }
            };
            const result = getRes();

            const infoList = item.find('td');

            const time = infoList.eq(0).text() + ' ' + infoList.eq(1).text();
            const tournament = infoList.eq(6).text();
            const score = infoList.eq(7).text();
            const opponent = infoList.eq(8).text();

            return {
                title: `[${result}] ${team} ${score} ${opponent} on ${tournament}`,
                description: `${time},  ${team} ${score} ${opponent} on ${tournament}`,
                link: currentUrl,
                guid: currentUrl + time,
            };
        })
        .get();

    ctx.state.data = {
        title: `[Counter-Strike] ${team} Match Results From Liquipedia`,
        link: currentUrl,
        item: matches,
    };
};
