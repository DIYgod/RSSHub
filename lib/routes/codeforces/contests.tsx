import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { formatDate, parseDate } from '@/utils/time';

const sec2str = (sec) =>
    Temporal.Duration.from({ seconds: Number.parseInt(sec) })
        .round({ largestUnit: 'day' })
        .toLocaleString('zh-CN');

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
            const date = parseDate(contest.startTimeSeconds, 'X');
            const description = renderToString(
                <>
                    <p>开始时间：{date && formatDate(date, 'YYYY年M月D日 HH:mm')}</p>
                    <p>持续时间：{sec2str(contest.durationSeconds)}</p>
                    <p>比赛类型：{contest.type}</p>
                </>
            );

            return {
                title,
                description,
                pubDate: parseDate(contest.startTimeSeconds * 1000),
                link: 'https://codeforces.com/contests/' + contest.id,
            };
        });

    return {
        title: 'Codeforces - Contests',
        link: 'https://codeforces.com/contests',
        item: items,
    };
}
