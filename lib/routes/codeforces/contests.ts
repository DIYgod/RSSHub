import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { art } from '@/utils/render';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

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
            const description = art(path.join(__dirname, 'templates/contest.art'), {
                title,
                startTime: date.format('LL LT'),
                durationTime: sec2str(contest.durationSeconds),
                // relativeTime: sec2str(contest.relativeTimeSeconds),
                type: contest.type,
            });

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
