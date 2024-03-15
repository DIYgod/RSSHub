import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/dota2/matches/:id',
    categories: ['game'],
    example: '/liquipedia/dota2/matches/Team_Aster',
    parameters: { id: '战队名称，可在url中找到。例如:https://liquipedia.net/dota2/Team_Aster' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['liquipedia.net/dota2/:id'],
        },
    ],
    name: 'Dota2 战队最近比赛结果',
    maintainers: ['wzekin'],
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('id');
    const url = `https://liquipedia.net/dota2/${team}`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = load(data);
    const list = $('div.recent-matches > table > tbody > tr[style]');

    return {
        title: `Liquipedia Dota2 ${team} Matches`,
        link: url,
        item: list?.toArray().map((item) => {
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
            const tournament = item.find('td:nth-child(6) > a').text();
            const dateTime = parseDate(date + ' ' + time);
            const score = item.find('td:nth-child(7)').text();
            const vs_team = item.find('td:nth-child(8) > span > span.team-template-text > a').text();

            return {
                title: `[${message}] ${score} ${vs_team}`,
                description: `At ${tournament},  ${team} ${score} ${vs_team}`,
                pubDate: dateTime,
                link: url,
                guid: url + dateTime,
            };
        }),
    };
}
