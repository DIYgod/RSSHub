import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/counterstrike/matches/:team',
    radar: [
        {
            source: ['liquipedia.net/counterstrike/:id/Matches', 'liquipedia.net/dota2/:id'],
            target: '/counterstrike/matches/:id',
        },
    ],
    example: '/liquipedia/counterstrike/matches/Team_Falcons',
    name: 'Counter-Strike Team Match Results',
    maintainers: ['CookiePieWw'],
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('team');

    const rootUrl = 'https://liquipedia.net';
    const currentUrl = `${rootUrl}/counterstrike/${team}/Matches`;

    const response = await ofetch(currentUrl);

    const $ = load(response);
    const table = $('table').first();
    const header = table.find('th');
    const columnMap: { date?: number; tournament?: number; score?: number; opponent?: number } = {};
    header.each((index, element) => {
        const text = $(element).text().trim().toLowerCase();
        if (text.includes('date')) {
            columnMap.date = index;
        }
        if (text.includes('tournament')) {
            columnMap.tournament = index;
        }
        if (text.includes('score')) {
            columnMap.score = index;
        }
        if (text.includes('opponent')) {
            columnMap.opponent = index;
        }
    });

    const list = $('.recent-matches-bg-lose, .recent-matches-bg-win');

    const matches = list.toArray().map((item) => {
        const html = $(item);

        const getRes = () => (html.attr('class') === 'recent-matches-bg-lose' ? 'LOSS' : 'WIN');
        const result = getRes();
        const infoList = html.find('td');

        const time = infoList
            .eq(columnMap.date ?? 0)
            .text()
            .trim();
        const tournament = infoList
            .eq(columnMap.tournament ?? 5)
            .text()
            .trim();
        const score = infoList
            .eq(columnMap.score ?? 7)
            .text()
            .trim();
        const opponent = infoList
            .eq(columnMap.opponent ?? 8)
            .text()
            .trim();

        return {
            title: `[${result}] ${team} ${score} ${opponent} on ${tournament}`,
            description: `${time},  ${team} ${score} ${opponent} on ${tournament}`,
            link: currentUrl,
            guid: currentUrl + time,
        };
    });

    return {
        title: `[Counter-Strike] ${team} Match Results From Liquipedia`,
        link: currentUrl,
        item: matches,
    };
}
