import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/counterstrike/matches/:team',
    radar: [
        {
            source: ['liquipedia.net/counterstrike/:id/Matches', 'liquipedia.net/dota2/:id'],
            target: '/counterstrike/matches/:id',
        },
    ],
    name: 'Unknown',
    maintainers: ['CookiePieWw'],
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('team');

    const rootUrl = 'https://liquipedia.net';
    const currentUrl = `${rootUrl}/counterstrike/${team}/Matches`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('.recent-matches-bg-lose, .recent-matches-bg-win');

    const matches = list
        .map((_, item) => {
            item = $(item);

            const getRes = () => (item.attr('class') === 'recent-matches-bg-lose' ? 'LOSS' : 'WIN');
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

    return {
        title: `[Counter-Strike] ${team} Match Results From Liquipedia`,
        link: currentUrl,
        item: matches,
    };
}
