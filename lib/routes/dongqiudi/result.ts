import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/result/:team',
    categories: ['sport'],
    example: '/dongqiudi/result/50001755',
    parameters: { team: '球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到' },
    radar: [
        {
            source: ['www.dongqiudi.com/team/*team'],
            target: (params) => `/dongqiudi/result/${params.team.replace('.html', '')}`,
        },
    ],
    name: '足球赛果',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const team = ctx.req.param('team');
    const link = `https://www.dongqiudi.com/team/${team}.html`;

    const { data: scheduleData } = await got(`https://api.dongqiudi.com/data/v1/team/schedule/${team}`);
    const lastSeason = scheduleData.season_list.find((s) => !s.current);

    if (!lastSeason) {
        return {
            title: `${team} 比赛结果`,
            link,
            item: [],
        };
    }

    const { data: seasonResp } = await got(lastSeason.url);
    const resultData = seasonResp.data.filter((match) => match.fs_A && match.fs_B);

    const teamName = resultData.length ? (resultData[0].team_A_id === team ? resultData[0].team_A_name : resultData[0].team_B_name) : team;

    const out = resultData.map((result) => ({
        title: `${result.match_title} ${result.team_A_name} ${result.fs_A}-${result.fs_B} ${result.team_B_name}`,
        guid: result.match_id,
        link: result.scheme.replace('dongqiudi:///game/', 'https://www.dongqiudi.com/liveDetail/'),
        pubDate: parseDate(result.start_play),
    }));

    return {
        title: `${teamName} 比赛结果`,
        link,
        item: out.slice(-10),
    };
}
