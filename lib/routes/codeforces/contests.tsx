import 'dayjs/locale/zh-cn.js';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const sec2str = (sec) => dayjs.duration(Number.parseInt(sec), 'seconds').humanize();

const contestAPI = 'https://codeforces.com/api/contest.list';

export const route: Route = {
    path: '/contests',
    categories: ['programming'],
    example: '/codeforces/contests',
    parameters: {},
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
            source: ['www.codeforces.com/contests'],
        },
    ],
    name: 'Latest contests',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.codeforces.com/contests',
};

async function handler() {
    const contestsData = await ofetch(contestAPI);
    const contests = contestsData.result;

    const items = contests
        .filter((contests) => contests.phase === 'BEFORE')
        .map((contest) => {
            const title = String(contest.name);
            const date = dayjs.unix(Number.parseInt(contest.startTimeSeconds));
            const description = renderToString(
                <>
                    <p>比赛：{title}</p>
                    <p>开始时间：{date.format('LL LT')}</p>
                    <p>持续时间：{sec2str(contest.durationSeconds)}</p>
                    <p>比赛类型：{contest.type}</p>
                </>
            );

            return {
                title,
                description,
                link: 'https://codeforces.com/contests/' + contest.id,
            };
        });

    return {
        title: 'Codeforces - Contests',
        link: 'https://codeforces.com/contests',
        item: items,
    };
}
