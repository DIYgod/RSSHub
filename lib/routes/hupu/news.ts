import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { NBA_TEAMS_ID_MAP } from './consts';
import { getEntryDetails } from './utils';

export const route: Route = {
    path: ['/news/:team'],
    name: '队伍新闻',
    url: 'm.hupu.com',
    maintainers: ['hyoban'],
    example: '/news/Spurs',
    parameters: {
        team: {
            description: '全小写的英文队名，例如：spurs, lakers, warriors 等等',
        },
    },
    categories: ['bbs'],
    handler: async (ctx): Promise<Data> => {
        const team = NBA_TEAMS_ID_MAP[ctx.req.param('team')];
        const teamId = team?.teamId;
        if (!teamId) {
            throw new Error('Invalid team name');
        }
        const data = await ofetch(`https://games.mobileapi.hupu.com/3/7.5.60/basketballapi/news/v2/teamNewsById?cateGoryCode=basketball&clientId=93977196&newsId=0&teamId=${teamId}`);

        let items: DataItem[] = data.result.map((item) => ({
            title: item.title,
            guid: item.tid,
            link: `https://m.hupu.com/bbs/${item.tid}`,
            pubDate: timezone(parseDate(item.publishTime), +8),
        }));

        items = await Promise.all(items.map((item) => getEntryDetails(item)));

        return {
            title: `虎扑 - ${team.teamName} 新闻`,
            link: 'https://m.hupu.com',
            item: items,
        } as Data;
    },
};
